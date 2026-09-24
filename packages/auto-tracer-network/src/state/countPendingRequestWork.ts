import type { RequestCaptureSnapshot } from "../capture/RequestCaptureSnapshot.js";

/**
 * Counts logging work contributed by an admitted request.
 *
 * @param included - Whether the request passed filtering.
 * @param capture - Request-scoped capture settings.
 * @returns Pending outcome and detail work contributed by the request.
 */
export function countPendingRequestWork(
  included: boolean,
  capture: RequestCaptureSnapshot,
): number {
  if (!included) {
    return 0;
  }

  return (
    1 +
    Number(capture.captureRequestHeaders) +
    Number(capture.captureRequestBody) +
    Number(capture.captureResponseHeaders) +
    Number(capture.captureResponseBody)
  );
}
