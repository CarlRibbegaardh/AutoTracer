import { createRequestStartEvent } from "../events/createRequestStartEvent.js";
import { createSettlingFetchOutcomeObservers } from "./createSettlingFetchOutcomeObservers.js";
import { invokeObservedFetch } from "./invokeObservedFetch.js";

/**
 * Executes one admitted Fetch request with correlated lifecycle observation.
 *
 * @param nativeFetch - Native Fetch implementation to invoke.
 * @param request - Original Fetch input and initialization values.
 * @param trace - Request identity, timing source, and event sink.
 * @returns The exact promise returned by the native Fetch implementation.
 */
export function invokeTracedFetchRequest(
  nativeFetch: Parameters<typeof invokeObservedFetch>[0],
  request: Parameters<typeof invokeObservedFetch>[1],
  trace: Parameters<typeof createSettlingFetchOutcomeObservers>[0] &
    Readonly<{
      beginPendingWork: () => void;
      startRequestDetails?: () => void;
    }>,
): Promise<Response> {
  trace.beginPendingWork();
  trace.emit(
    createRequestStartEvent(trace.requestId, trace.method, trace.requestedUrl),
  );
  trace.startRequestDetails?.();

  return invokeObservedFetch(
    nativeFetch,
    request,
    createSettlingFetchOutcomeObservers(trace),
  );
}
