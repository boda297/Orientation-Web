import { refreshAuthToken } from './api/auth.api';

/**
 * A drop-in replacement for `fetch` that:
 * 1. Includes credentials ('include') so the browser automatically sends HttpOnly cookies.
 * 2. On a 401 response, silently calls `refreshAuthToken()` and
 *    retries the original request once with the refreshed cookies.
 * 3. If the refresh itself fails, redirects to `/login`.
 */
export async function fetchWithAuth(
  url: string,
  options?: RequestInit & { auth?: boolean; redirectOnFail?: boolean }
): Promise<Response> {
  const { auth = true, redirectOnFail = false, ...fetchOptions } = options ?? {};

  // --- First attempt ---
  const firstResponse = await fetch(url, {
    ...fetchOptions,
    credentials: 'include', // Automatically sends HttpOnly cookies
  });

  // Happy path
  if (firstResponse.status !== 401) {
    return firstResponse;
  }

  // --- 401: try to refresh ---
  try {
    await refreshAuthToken();

    // Retry with the refreshed cookies
    const retryResponse = await fetch(url, {
      ...fetchOptions,
      credentials: 'include',
    });

    return retryResponse;
  } catch {
    // Refresh failed — evict session
    if (redirectOnFail && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    // Return a synthetic 401 so callers don't crash while the redirect happens
    return new Response(JSON.stringify({ message: 'Session expired.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
