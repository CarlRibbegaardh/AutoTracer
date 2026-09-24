import { createTimedFetchRejectionEvents } from "./createTimedFetchRejectionEvents.js";
import { emitFetchRejectionEvents } from "./emitFetchRejectionEvents.js";

/**
 * Creates an observer that emits timed Fetch rejection events at settlement.
 *
 * @param input - Request identity, timing source, and rejection event sink.
 * @returns A Fetch rejection observer.
 */
export function createFetchRejectionObserver(
  input: Readonly<{
    requestId: number;
    method: string;
    requestedUrl: string;
    startMarker: number;
    getCompletionMarker: () => number;
    emit: Parameters<typeof emitFetchRejectionEvents>[1];
  }>,
): (failure: unknown) => void {
  return (failure) =>
    {return emitFetchRejectionEvents(
      createTimedFetchRejectionEvents({
        requestId: input.requestId,
        method: input.method,
        requestedUrl: input.requestedUrl,
        startMarker: input.startMarker,
        completionMarker: input.getCompletionMarker(),
        failure,
      }),
      input.emit,
    )};
}
