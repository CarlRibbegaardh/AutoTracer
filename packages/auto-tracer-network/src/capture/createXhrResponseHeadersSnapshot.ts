/**
 * Parses the response-header block exposed by an XHR instance.
 *
 * @param rawHeaders - Browser-exposed response headers from getAllResponseHeaders.
 * @returns A detached header snapshot containing valid exposed header lines.
 */
export function createXhrResponseHeadersSnapshot(rawHeaders: string): Headers {
  const headers = new Headers();

  for (const line of rawHeaders.split(/\r\n|\n|\r/)) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex < 1) continue;

    headers.append(
      line.slice(0, separatorIndex),
      line.slice(separatorIndex + 1).trim(),
    );
  }

  return headers;
}
