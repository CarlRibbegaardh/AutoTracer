/**
 * Creates a detached snapshot of browser-visible response headers.
 *
 * @param response - Application-owned response.
 * @returns A detached copy of the response headers.
 */
export function createResponseHeadersSnapshot(response: Response): Headers {
  return new Headers(response.headers);
}
