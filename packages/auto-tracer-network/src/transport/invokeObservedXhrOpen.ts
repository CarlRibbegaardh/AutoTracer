/**
 * Invokes native XHR open and observes successful completion.
 *
 * @param nativeOpen - Bound native XHR open implementation.
 * @param args - Original script-provided open arguments.
 * @param observeOpen - Records tracing state after native success.
 */
export function invokeObservedXhrOpen(
  nativeOpen: (
    ...args:
      | [method: string, url: string | URL]
      | [
          method: string,
          url: string | URL,
          async: boolean,
          username?: string | null,
          password?: string | null,
        ]
  ) => void,
  args:
    | readonly [method: string, url: string | URL]
    | readonly [
        method: string,
        url: string | URL,
        async: boolean,
        username?: string | null,
        password?: string | null,
      ],
  observeOpen: () => void,
): void {
  nativeOpen(...args);

  try {
    observeOpen();
  } catch {
  }
}
