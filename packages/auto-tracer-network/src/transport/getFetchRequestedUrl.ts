/**
 * Reads the requested URL text from a Fetch input value.
 *
 * @param input - Fetch Request, URL, or string input.
 * @returns The URL text supplied by the application or exposed by Request.
 */
export function getFetchRequestedUrl(input: RequestInfo | URL): string {
  if (input instanceof Request) return input.url;
  if (input instanceof URL) return input.href;
  return input;
}
