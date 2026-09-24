/**
 * Returns the browser-exposed final URL for a redirected fetch response.
 *
 * @param redirected - Browser-exposed fetch redirect signal.
 * @param responseUrl - Browser-exposed final response URL.
 * @returns The final URL when redirected, otherwise `undefined`.
 */
export function getFetchRedirectUrl(
  redirected: boolean,
  responseUrl: string,
): string | undefined {
  return redirected ? responseUrl : undefined;
}
