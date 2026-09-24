import type { RequestCaptureSnapshot } from "./RequestCaptureSnapshot.js";
import { createResponseBodyCaptureTask } from "./createResponseBodyCaptureTask.js";
import { createResponseHeadersDetailEvent } from "./createResponseHeadersDetailEvent.js";
import { startResponseBodyCapture } from "./startResponseBodyCapture.js";
import { startResponseHeadersCapture } from "./startResponseHeadersCapture.js";

/**
 * Starts every enabled response detail for one admitted Fetch response.
 *
 * @param requestId - Session request identifier.
 * @param response - Application-visible Fetch response.
 * @param input - Capture snapshot and pending-output operations.
 */
export function startFetchResponseDetails(
  requestId: number,
  response: Response,
  input: Readonly<{
    capture: RequestCaptureSnapshot;
    beginPendingWork: () => void;
    canEmitPendingOutput: () => boolean;
    emit: (
      event:
        | ReturnType<typeof createResponseHeadersDetailEvent>
        | Awaited<ReturnType<typeof createResponseBodyCaptureTask>>,
    ) => void;
    settlePendingWork: () => void;
  }>,
): void {
  if (input.capture.captureResponseHeaders) {
    startResponseHeadersCapture(requestId, response, {
      ...input,
      redactionPatterns: input.capture.redactionPatterns,
    });
  }

  if (input.capture.captureResponseBody) {
    void startResponseBodyCapture(requestId, response, {
      ...input,
      bodyCaptureLimit: input.capture.bodyCaptureLimit,
      redactionPatterns: input.capture.redactionPatterns,
    });
  }
}
