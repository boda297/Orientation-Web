/**
 * Interface contract for managing access and refresh token storage.
 */
export interface ITokenStorage {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  setTokens(accessToken: string, refreshToken: string): void;
  clear(): void;
  isValid(): boolean;
  canRefresh(): boolean;
  getUserPayload(): any | null;
}

// Distinct cookie names for client-side JavaScript access to avoid collisions
// with server-set HttpOnly cookies (which browsers block JavaScript from writing or reading)
const ACCESS_TOKEN_KEY = 'app_access_token';
const REFRESH_TOKEN_KEY = 'app_refresh_token';
const ACCESS_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days (persisted in cookies)
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60; // 30 days
const isBrowser = () => typeof window !== 'undefined';

/**
 * Safely decodes a JWT token without throwing on base64url characters.
 */
export function parseJwt(token: string): any | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Cookie-only implementation of token storage.
 * Tokens are strictly stored in and read from document cookies.
 */
class CookieTokenStorage implements ITokenStorage {
  // Reads a cookie value by key name strictly from document.cookie
  private read(name: string): string | null {
    if (!isBrowser()) return null;
    try {
      const match = document.cookie.match(
        new RegExp(`(?:^|;\\s*)${name}=([^;]*)`)
      );
      if (match && match[1]) {
        const val = decodeURIComponent(match[1]);
        if (val && val !== 'undefined' && val !== 'null' && val.trim() !== '') return val;
      }
    } catch {
      // Ignore cookie read error
    }
    return null;
  }

  // Writes a key-value cookie with path, max-age, SameSite, and conditional Secure attributes
  private write(name: string, value: string, maxAgeSeconds: number) {
    if (!isBrowser()) return;
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`;
  }

  // Expire/delete a cookie by setting max-age to 0
  private expire(name: string) {
    if (!isBrowser()) return;
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
    // Clean up any legacy localStorage entry if present
    try {
      localStorage.removeItem(name);
    } catch {
      // Ignore error
    }
  }

  // Retrieves stored JWT access token strictly from cookies
  getAccessToken(): string | null {
    return this.read(ACCESS_TOKEN_KEY) || this.read('accessToken');
  }

  // Retrieves stored JWT refresh token strictly from cookies
  getRefreshToken(): string | null {
    return this.read(REFRESH_TOKEN_KEY) || this.read('refreshToken');
  }

  // Stores access and refresh tokens exclusively in browser cookies
  setTokens(accessToken: string, refreshToken: string) {
    this.write(ACCESS_TOKEN_KEY, accessToken, ACCESS_TOKEN_MAX_AGE);
    this.write(REFRESH_TOKEN_KEY, refreshToken, REFRESH_TOKEN_MAX_AGE);

    // Remove legacy tokens from localStorage if they existed
    if (isBrowser()) {
      try {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } catch {
        // Ignore error
      }
      window.dispatchEvent(new Event('auth-change'));
    }
  }

  // Deletes both access and refresh tokens from cookies
  clear() {
    this.expire(ACCESS_TOKEN_KEY);
    this.expire(REFRESH_TOKEN_KEY);
    this.expire('accessToken');
    this.expire('refreshToken');
    if (isBrowser()) {
      window.dispatchEvent(new Event('auth-change'));
    }
  }

  // Decodes the payload of the active access token
  getUserPayload(): any | null {
    const token = this.getAccessToken();
    if (!token) return null;
    return parseJwt(token);
  }

  // Checks if a valid, non-expired access token is present in cookies.
  // Returns false when the access token is expired, even if a refresh token exists.
  // This is the correct UI-gating check — use canRefresh() for interceptor logic.
  isValid(): boolean {
    const token = this.getAccessToken();
    if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
      return false;
    }
    const payload = parseJwt(token);
    if (payload && payload.exp) {
      // Check if token is expired (with 10s buffer)
      const isExpired = Date.now() >= (payload.exp * 1000) - 10000;
      if (isExpired) {
        // Access token is expired — user is not currently authenticated from the UI's perspective.
        // The httpClient interceptor will silently refresh on the next API call if canRefresh() is true.
        return false;
      }
    }
    return true;
  }

  // Returns true if a refresh token is available, meaning the interceptor can attempt
  // a silent token refresh on the next API call even when isValid() is false.
  canRefresh(): boolean {
    return !!this.getRefreshToken();
  }
}

export const tokenStorage: ITokenStorage = new CookieTokenStorage();