import { invokeObservedXhrOpen } from "./invokeObservedXhrOpen.js";
import { recordXhrOpen } from "./recordXhrOpen.js";

/**
 * Invokes native XHR open and records successful tracing state.
 *
 * @param nativeOpen - Bound native XHR open implementation.
 * @param args - Original script-provided open arguments.
 * @param runtime - Per-instance state, timing, and output operations.
 */
export function invokeXhrOpenRequest(
  nativeOpen: Parameters<typeof invokeObservedXhrOpen>[0],
  args: Parameters<typeof invokeObservedXhrOpen>[1],
  runtime: Parameters<typeof recordXhrOpen>[1] &
    Parameters<typeof recordXhrOpen>[2] &
    Readonly<{ clearRequestHeaders: () => void }>,
): void {
  /** Records metadata after native open succeeds. */
  function observeOpen(): void {
    const openInput =
      args.length === 2
        ? { method: args[0], requestedUrl: String(args[1]) }
        : {
            method: args[0],
            requestedUrl: String(args[1]),
            async: args[2],
          };

    runtime.clearRequestHeaders();
    recordXhrOpen(openInput, runtime, runtime);
  }

  invokeObservedXhrOpen(nativeOpen, args, observeOpen);
}
