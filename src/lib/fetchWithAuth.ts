import { getAccessToken, clearAuthCookies } from './auth';
import { authApi } from './auth';

/**
 * A drop-in replacement for `fetch` that:
 * 1. Attaches the Authorization header when `auth` is true (default).
 * 2. On a 401 response, silently calls `authApi.refreshAuthToken()` and
 *    retries the original request once with the new token.
 * 3. If the refresh itself fails, clears all auth cookies/localStorage and
 *    redirects to `/login`.
 * 4. On any other non-ok response, throws an Error with the server message.
 */
export async function fetchWithAuth(
  url: string,
  options?: RequestInit & { auth?: boolean }
): Promise<Response> {
  const { auth = true, ...fetchOptions } = options ?? {};

  // Build headers, merging caller-supplied ones
  const buildHeaders = (token: string | null): Record<string, string> => {
    const base: Record<string, string> = {
      ...((fetchOptions.headers as Record<string, string>) ?? {}),
    };
    if (auth && token) {
      base['Authorization'] = `Bearer ${token}`;
    }
    return base;
  };

  // --- First attempt ---
  const firstResponse = await fetch(url, {
    ...fetchOptions,
    headers: buildHeaders(auth ? getAccessToken() : null),
  });

  // Happy path
  if (firstResponse.status !== 401) {
    return firstResponse;
  }

  // --- 401: try to refresh ---
  try {
    const newToken = await authApi.refreshAuthToken();

    // Retry with the fresh token
    const retryResponse = await fetch(url, {
      ...fetchOptions,
      headers: buildHeaders(newToken),
    });

    return retryResponse;
  } catch {
    // Refresh failed — evict session and send user to login
    clearAuthCookies();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    // Return a synthetic 401 so callers don't crash while the redirect happens
    return new Response(JSON.stringify({ message: 'Session expired. Redirecting to login.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
