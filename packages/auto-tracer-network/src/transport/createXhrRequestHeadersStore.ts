/**
 * Creates script-provided request-header storage for one XHR instance.
 *
 * @returns Header snapshot, append, and reset operations.
 */
export function createXhrRequestHeadersStore(): Readonly<{
  getRequestHeaders: () => Headers;
  appendRequestHeader: (name: string, value: string) => void;
  clearRequestHeaders: () => void;
}> {
  let requestHeaders = new Headers();

  /** Returns a detached snapshot of the recorded request headers. */
  function getRequestHeaders(): Headers {
    return new Headers(requestHeaders);
  }

  /** Appends one successfully applied script-provided request header. */
  function appendRequestHeader(name: string, value: string): void {
    requestHeaders.append(name, value);
  }

  /** Clears request headers for a later open invocation. */
  function clearRequestHeaders(): void {
    requestHeaders = new Headers();
  }

  return {
    getRequestHeaders,
    appendRequestHeader,
    clearRequestHeaders,
  };
}
