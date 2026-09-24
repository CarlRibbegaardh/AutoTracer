/**
 * Returns an available XHR response URL when it differs from the request URL.
 *
 * @param normalizedRequestedUrl - Absolute normalized requested URL.
 * @param responseUrl - Browser-exposed XHR response URL, or an empty string when unavailable.
 * @returns The final URL when a redirect is observable, otherwise `undefined`.
 */
export function getXhrRedirectUrl(
  normalizedRequestedUrl: string,
  responseUrl: string,
): string | undefined {
  if (responseUrl === "" || responseUrl === normalizedRequestedUrl) {
    return undefined;
  }

  return responseUrl;
}
