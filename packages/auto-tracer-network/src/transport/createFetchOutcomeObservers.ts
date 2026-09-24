import { createFetchRejectionObserver } from "./createFetchRejectionObserver.js";
import type { createFetchResponseEvent } from "./createFetchResponseEvent.js";
import { createFetchResponseObserver } from "./createFetchResponseObserver.js";
import type { emitFetchRejectionEvents } from "./emitFetchRejectionEvents.js";

/**
 * Creates the outcome observers for one Fetch request.
 *
 * @param input - Request identity, timing source, and event sink.
 * @returns Response, rejection, and synchronous-failure observers.
 */
export function createFetchOutcomeObservers(
  input: Readonly<{
    requestId: number;
    method: string;
    requestedUrl: string;
    startMarker: number;
    getCompletionMarker: () => number;
    emit: (
      event:
        | ReturnType<typeof createFetchResponseEvent>
        | Parameters<Parameters<typeof emitFetchRejectionEvents>[1]>[0],
    ) => void;
  }>,
): Readonly<{
  onResolved: ReturnType<typeof createFetchResponseObserver>;
  onRejected: ReturnType<typeof createFetchRejectionObserver>;
  onSynchronousFailure: ReturnType<typeof createFetchRejectionObserver>;
}> {
  const onRejected = createFetchRejectionObserver(input);

  return {
    onResolved: createFetchResponseObserver(input),
    onRejected,
    onSynchronousFailure: onRejected,
  };
}
