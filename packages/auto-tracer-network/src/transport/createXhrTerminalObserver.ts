import { calculateElapsedDuration } from "../timing/calculateElapsedDuration.js";
import { createXhrTerminalEvent } from "./createXhrTerminalEvent.js";

/**
 * Creates an observer for one native XHR terminal event type.
 *
 * @param eventType - Native XHR terminal event type to observe.
 * @param xhr - Browser-visible XHR terminal state.
 * @param input - Request identity, timing, output, and settlement operations.
 * @returns A one-request terminal observer.
 */
export function createXhrTerminalObserver(
  eventType: "load" | "error" | "abort" | "timeout",
  xhr: Readonly<Pick<XMLHttpRequest, "status" | "responseURL">>,
  input: Readonly<{
    requestId: number;
    method: string;
    requestedUrl: string;
    normalizedRequestedUrl: string;
    startMarker: number;
    getCompletionMarker: () => number;
    claimTerminalOutcome: () => boolean;
    canEmitPendingOutput: () => boolean;
    emit: (event: ReturnType<typeof createXhrTerminalEvent>) => void;
    startResponseDetails?: () => void;
    settlePendingWork: () => void;
  }>,
): () => void {
  return function observeXhrTerminalEvent(): void {
    if (!input.claimTerminalOutcome()) {
      return;
    }

    try {
      if (!input.canEmitPendingOutput()) {
        return;
      }

      const completionMarker = input.getCompletionMarker();
      input.emit(
        createXhrTerminalEvent({
          eventType,
          requestId: input.requestId,
          status: xhr.status,
          method: input.method,
          requestedUrl: input.requestedUrl,
          normalizedRequestedUrl: input.normalizedRequestedUrl,
          responseUrl: xhr.responseURL,
          elapsedMilliseconds: calculateElapsedDuration(
            input.startMarker,
            completionMarker,
          ),
        }),
      );
      if (eventType === "load") {
        input.startResponseDetails?.();
      }
    } catch {
    } finally {
      input.settlePendingWork();
    }
  };
}
