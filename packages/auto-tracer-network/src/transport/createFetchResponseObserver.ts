import { createFetchResponseEvent } from "./createFetchResponseEvent.js";

/**
 * Creates an observer that emits a timed Fetch response event at settlement.
 *
 * @param input - Request identity, timing source, and response event sink.
 * @returns A Fetch response observer.
 */
export function createFetchResponseObserver(
  input: Readonly<{
    requestId: number;
    method: string;
    requestedUrl: string;
    startMarker: number;
    getCompletionMarker: () => number;
    emit: (event: ReturnType<typeof createFetchResponseEvent>) => void;
  }>,
): (response: Response) => void {
  return (response) =>
    {return input.emit(
      createFetchResponseEvent({
        requestId: input.requestId,
        method: input.method,
        requestedUrl: input.requestedUrl,
        startMarker: input.startMarker,
        completionMarker: input.getCompletionMarker(),
        response,
      }),
    )};
}
