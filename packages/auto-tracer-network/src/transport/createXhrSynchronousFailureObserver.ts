import { createTimedFetchRejectionEvents } from "./createTimedFetchRejectionEvents.js";
import { emitFetchRejectionEvents } from "./emitFetchRejectionEvents.js";
import type { startTracedXhrRequest } from "./startTracedXhrRequest.js";

/**
 * Creates a synchronous native XHR send failure observer.
 *
 * @param request - Active request identity and terminal operations.
 * @param getCompletionMarker - Returns a monotonic completion marker.
 * @param emit - Emits failure lifecycle and detail events.
 * @returns A one-request synchronous failure observer.
 */
export function createXhrSynchronousFailureObserver(
  request: ReturnType<typeof startTracedXhrRequest>,
  getCompletionMarker: () => number,
  emit: Parameters<typeof emitFetchRejectionEvents>[1],
): (failure: unknown) => void {
  return function observeXhrSynchronousFailure(failure: unknown): void {
    if (!request.claimTerminalOutcome()) {
      return;
    }

    try {
      request.removeTerminalListeners();
      emitFetchRejectionEvents(
        createTimedFetchRejectionEvents({
          requestId: request.requestId,
          method: request.method,
          requestedUrl: request.requestedUrl,
          startMarker: request.startMarker,
          completionMarker: getCompletionMarker(),
          failure,
        }),
        emit,
      );
    } catch {
    } finally {
      request.settlePendingWork();
    }
  };
}
