import { calculateElapsedDuration } from "../timing/calculateElapsedDuration.js";
import { createFetchCompletionEvent } from "./createFetchCompletionEvent.js";

/**
 * Creates a Fetch response event from browser metadata and timing markers.
 *
 * @param input - Request identity, monotonic markers, and response metadata.
 * @returns An ordinary or redirected HTTP completion event.
 */
export function createFetchResponseEvent(
  input: Readonly<{
    requestId: number;
    method: string;
    requestedUrl: string;
    startMarker: number;
    completionMarker: number;
    response: Readonly<{
      status: number;
      url: string;
      redirected: boolean;
    }>;
  }>,
): ReturnType<typeof createFetchCompletionEvent> {
  return createFetchCompletionEvent({
    requestId: input.requestId,
    status: input.response.status,
    method: input.method,
    requestedUrl: input.requestedUrl,
    responseUrl: input.response.url,
    redirected: input.response.redirected,
    elapsedMilliseconds: calculateElapsedDuration(
      input.startMarker,
      input.completionMarker,
    ),
  });
}
