/**
 * Reads a browser-visible content type from a header snapshot.
 *
 * @param headers - Script-visible headers.
 * @returns The content type, or null when unavailable.
 */
export function getHeaderContentType(headers: Headers): string | null {
  return headers.get("content-type");
}
