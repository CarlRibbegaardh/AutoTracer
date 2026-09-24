import { invokeTransportWithFailureObserver } from "./invokeTransportWithFailureObserver.js";
import { invokeNativeFetch } from "./invokeNativeFetch.js";
import { observeFetchPromise } from "./observeFetchPromise.js";

/**
 * Invokes Fetch and observes its synchronous and asynchronous outcomes.
 *
 * @param nativeFetch - Native Fetch implementation to invoke.
 * @param request - Original Fetch input and initialization values.
 * @param observers - Callbacks for native Fetch outcomes.
 * @returns The exact promise returned by the native Fetch implementation.
 */
export function invokeObservedFetch(
  nativeFetch: (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => Promise<Response>,
  request: Readonly<{
    input: RequestInfo | URL;
    init?: RequestInit;
    hasInit?: boolean;
  }>,
  observers: Readonly<{
    onResolved: (response: Response) => void;
    onRejected: (reason: unknown) => void;
    onSynchronousFailure: (failure: unknown) => void;
  }>,
): Promise<Response> {
  const nativePromise = invokeTransportWithFailureObserver(
    () => {return invokeNativeFetch(nativeFetch, request)},
    observers.onSynchronousFailure,
  );

  return observeFetchPromise(
    nativePromise,
    observers.onResolved,
    observers.onRejected,
  );
}
