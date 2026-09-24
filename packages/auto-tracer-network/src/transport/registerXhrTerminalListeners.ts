/**
 * Registers one request's native XHR terminal listeners.
 *
 * @param xhr - XHR event target receiving native terminal listeners.
 * @param listeners - Request-scoped terminal listeners.
 * @returns An operation that removes the registered listeners.
 */
export function registerXhrTerminalListeners(
  xhr: Readonly<{
    addEventListener: (
      eventType: "load" | "error" | "abort" | "timeout",
      listener: () => void,
    ) => void;
    removeEventListener: (
      eventType: "load" | "error" | "abort" | "timeout",
      listener: () => void,
    ) => void;
  }>,
  listeners: Readonly<{
    load: () => void;
    error: () => void;
    abort: () => void;
    timeout: () => void;
  }>,
): () => void {
  xhr.addEventListener("load", listeners.load);
  xhr.addEventListener("error", listeners.error);
  xhr.addEventListener("abort", listeners.abort);
  xhr.addEventListener("timeout", listeners.timeout);

  return function removeXhrTerminalListeners(): void {
    xhr.removeEventListener("load", listeners.load);
    xhr.removeEventListener("error", listeners.error);
    xhr.removeEventListener("abort", listeners.abort);
    xhr.removeEventListener("timeout", listeners.timeout);
  };
}
