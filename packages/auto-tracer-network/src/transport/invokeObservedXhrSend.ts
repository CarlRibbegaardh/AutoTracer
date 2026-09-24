import { invokeTransportWithFailureObserver } from "./invokeTransportWithFailureObserver.js";

/**
 * Invokes native XHR send while observing synchronous failures.
 *
 * @param nativeSend - Bound native XHR send implementation.
 * @param args - Original zero-or-one-argument send tuple.
 * @param observeFailure - Observes a synchronous native failure.
 */
export function invokeObservedXhrSend(
  nativeSend: (
    ...args: [] | [body: Document | XMLHttpRequestBodyInit | null]
  ) => void,
  args:
    | readonly []
    | readonly [body: Document | XMLHttpRequestBodyInit | null],
  observeFailure: (failure: unknown) => void,
): void {
  invokeTransportWithFailureObserver(
    () => {return nativeSend(...args)},
    observeFailure,
  );
}
