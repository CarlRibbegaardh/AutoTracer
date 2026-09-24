/**
 * Resolves a requested URL to its normalized absolute representation.
 *
 * @param requestedUrl - URL supplied to the browser transport.
 * @param baseUrl - Main-window URL used to resolve relative requests.
 * @returns The normalized absolute requested URL.
 */
export function normalizeRequestedUrl(
  requestedUrl: string,
  baseUrl: string,
): string {
  return new URL(requestedUrl, baseUrl).toString();
}
