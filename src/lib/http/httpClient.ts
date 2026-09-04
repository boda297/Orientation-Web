import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './tokenStorage';

// Extend AxiosRequestConfig to support explicit skipAuthRefresh and cache flags
declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuthRefresh?: boolean;
    skipCache?: boolean;
    cacheTTL?: number;
  }
}

/** Base API endpoint loaded from environment variables */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/** In-memory cache store for GET requests */
interface CacheEntry {
  data: any;
  timestamp: number;
}

const apiCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<any>>();
const DEFAULT_CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const SESSION_CACHE_PREFIX = 'api_cache_v1_';
const SESSION_CACHE_MAX_BYTES = 2 * 1024 * 1024; // 2MB max per cached payload

/**
 * Hydrate the in-memory cache from sessionStorage on module init.
 * This ensures navigating back to a cached page doesn't re-fetch.
 */
function hydrateFromSessionStorage() {
  if (typeof window === 'undefined') return;
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key?.startsWith(SESSION_CACHE_PREFIX)) continue;
      const raw = sessionStorage.getItem(key);
      if (!raw) continue;
      const entry: CacheEntry = JSON.parse(raw);
      // Only restore if the entry hasn't expired (within 2 hours)
      if (Date.now() - entry.timestamp < 2 * 60 * 60 * 1000) {
        apiCache.set(key.slice(SESSION_CACHE_PREFIX.length), entry);
      }
    }
  } catch {
    // sessionStorage may be unavailable (private browsing restrictions etc.)
  }
}

// Run hydration immediately when the module loads
hydrateFromSessionStorage();

/** Helper to clear in-memory cache */
export function clearApiCache(prefix?: string) {
  if (!prefix) {
    apiCache.clear();
    // Also clear sessionStorage entries
    if (typeof window !== 'undefined') {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key?.startsWith(SESSION_CACHE_PREFIX)) keysToRemove.push(key);
        }
        keysToRemove.forEach((k) => sessionStorage.removeItem(k));
      } catch { /* ignore */ }
    }
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.includes(prefix)) {
      apiCache.delete(key);
      if (typeof window !== 'undefined') {
        try { sessionStorage.removeItem(SESSION_CACHE_PREFIX + key); } catch { /* ignore */ }
      }
    }
  }
}

/** Shared Axios HTTP client configured with base URL and withCredentials for HttpOnly cookies */
const rawClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Automatically sends and receives HttpOnly cookies
});

/**
 * Request interceptor to automatically attach stored JWT access token as Authorization Bearer header.
 */
rawClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Shared promise lock to deduplicate concurrent token refresh requests */
let refreshPromise: Promise<any> | null = null;

/**
 * Sends a request to refresh the JWT access token.
 */
async function refreshAccessToken(): Promise<any> {
  const refreshToken = tokenStorage.getRefreshToken();
  const headers: Record<string, string> = {};
  if (refreshToken) {
    headers.Authorization = `Bearer ${refreshToken}`;
  }

  const { data } = await axios.post(
    `${BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true, skipAuthRefresh: true, headers }
  );

  if (data?.accessToken && data?.refreshToken) {
    tokenStorage.setTokens(data.accessToken, data.refreshToken);
  }

  return data;
}

/**
 * Response interceptor to handle 401 Unauthorized responses by refreshing tokens
 */
rawClient.interceptors.response.use(
  (response) => {
    // Invalidate cache on mutations
    const method = response.config?.method?.toUpperCase();
    if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const url = response.config?.url || '';
      const baseResource = url.split('/')[1] || '';
      if (baseResource && baseResource !== 'auth' && baseResource !== 'watch-history') {
        clearApiCache(`/${baseResource}`);
      }
    }
    return response;
  },
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean; skipAuthRefresh?: boolean };

    const isAuthRoute =
      original?.url?.includes('/auth/login') ||
      original?.url?.includes('/auth/register') ||
      original?.url?.includes('/auth/verify') ||
      original?.url?.includes('/auth/forgot-password') ||
      original?.url?.includes('/auth/reset-password') ||
      original?.url?.includes('/auth/refresh');

    const shouldSkipRefresh = original?.skipAuthRefresh || isAuthRoute;

    if (error.response?.status === 401 && original && !original._retry && !shouldSkipRefresh) {
      if (!tokenStorage.canRefresh()) {
        return Promise.reject(error);
      }

      original._retry = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => { refreshPromise = null; });
        await refreshPromise;

        const newAccessToken = tokenStorage.getAccessToken();
        if (newAccessToken) {
          original.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return rawClient(original);
      } catch (refreshErr) {
        tokenStorage.clear();
        clearApiCache();
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Custom wrapper with in-memory caching and request deduplication
 */
export const httpClient = {
  async get<T = any>(url: string, config?: any): Promise<{ data: T; status: number }> {
    const shouldSkipCache = config?.skipCache || url.includes('/auth') || url.includes('/watch-history/progress');
    const ttl = config?.cacheTTL || DEFAULT_CACHE_TTL;
    const cacheKey = `GET:${url}:${JSON.stringify(config?.params || {})}`;

    // 1. Return fresh cached response if available (0 network requests)
    if (!shouldSkipCache) {
      const cached = apiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < ttl) {
        return { data: cached.data as T, status: 200 };
      }

      // 2. Deduplicate concurrent in-flight requests
      if (inFlightRequests.has(cacheKey)) {
        return inFlightRequests.get(cacheKey)!;
      }
    }

    // 3. Fetch from network
    const requestPromise = rawClient
      .get<T>(url, config)
      .then((res) => {
        if (!shouldSkipCache && res.status >= 200 && res.status < 300) {
          const entry: CacheEntry = { data: res.data, timestamp: Date.now() };
          apiCache.set(cacheKey, entry);
          // Persist to sessionStorage so navigating back doesn't re-fetch
          if (typeof window !== 'undefined') {
            try {
              const serialized = JSON.stringify(entry);
              if (serialized.length < SESSION_CACHE_MAX_BYTES) {
                sessionStorage.setItem(SESSION_CACHE_PREFIX + cacheKey, serialized);
              }
            } catch { /* storage quota exceeded — silently skip */ }
          }
        }
        return { data: res.data, status: res.status };
      })
      .finally(() => {
        inFlightRequests.delete(cacheKey);
      });

    if (!shouldSkipCache) {
      inFlightRequests.set(cacheKey, requestPromise);
    }

    return requestPromise;
  },

  post<T = any>(url: string, data?: any, config?: any) {
    return rawClient.post<T>(url, data, config);
  },

  put<T = any>(url: string, data?: any, config?: any) {
    return rawClient.put<T>(url, data, config);
  },

  patch<T = any>(url: string, data?: any, config?: any) {
    return rawClient.patch<T>(url, data, config);
  },

  delete<T = any>(url: string, config?: any) {
    return rawClient.delete<T>(url, config);
  },
};