import { calculateElapsedDuration } from "../timing/calculateElapsedDuration.js";
import { createFetchRejectionEvents } from "./createFetchRejectionEvents.js";

/**
 * Creates Fetch rejection events from a native failure and timing markers.
 *
 * @param input - Request identity, monotonic markers, and native failure.
 * @returns A failed completion and optional native failure detail.
 */
export function createTimedFetchRejectionEvents(
  input: Readonly<{
    requestId: number;
    method: string;
    requestedUrl: string;
    startMarker: number;
    completionMarker: number;
    failure: unknown;
  }>,
): ReturnType<typeof createFetchRejectionEvents> {
  return createFetchRejectionEvents({
    requestId: input.requestId,
    method: input.method,
    requestedUrl: input.requestedUrl,
    elapsedMilliseconds: calculateElapsedDuration(
      input.startMarker,
      input.completionMarker,
    ),
    failure: input.failure,
  });
}
