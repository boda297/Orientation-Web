const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Builds the full API URL given an endpoint path.
 */
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${BASE_URL}${cleanEndpoint}`;
}

/**
 * Normalizes a file URL. If it's already an absolute URL (e.g. S3 CloudFront), returns as is.
 * Otherwise, prepends the backend base URL.
 */
export function getFileUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url;
  }
  return `${BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
}
