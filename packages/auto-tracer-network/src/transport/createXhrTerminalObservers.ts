import { createXhrTerminalObserver } from "./createXhrTerminalObserver.js";

/**
 * Creates all native terminal observers for one XHR request.
 *
 * @param xhr - Browser-visible XHR terminal state.
 * @param input - Shared request identity, timing, output, and settlement operations.
 * @returns Request-scoped load, error, abort, and timeout observers.
 */
export function createXhrTerminalObservers(
  xhr: Parameters<typeof createXhrTerminalObserver>[1],
  input: Parameters<typeof createXhrTerminalObserver>[2],
): Readonly<{
  load: () => void;
  error: () => void;
  abort: () => void;
  timeout: () => void;
}> {
  return {
    load: createXhrTerminalObserver("load", xhr, input),
    error: createXhrTerminalObserver("error", xhr, input),
    abort: createXhrTerminalObserver("abort", xhr, input),
    timeout: createXhrTerminalObserver("timeout", xhr, input),
  };
}
