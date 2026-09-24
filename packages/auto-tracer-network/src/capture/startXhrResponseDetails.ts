import type { RequestCaptureSnapshot } from "./RequestCaptureSnapshot.js";
import { createXhrResponseBodyCaptureTask } from "./createXhrResponseBodyCaptureTask.js";
import { createXhrResponseHeadersDetailEvent } from "./createXhrResponseHeadersDetailEvent.js";
import { startXhrResponseBodyCapture } from "./startXhrResponseBodyCapture.js";
import { startXhrResponseHeadersCapture } from "./startXhrResponseHeadersCapture.js";

/**
 * Starts every enabled response detail for one admitted XHR invocation.
 *
 * @param requestId - Session request identifier.
 * @param xhr - Browser-visible XHR response data and header operations.
 * @param input - Request-scoped capture policy and pending-output operations.
 */
export function startXhrResponseDetails(
  requestId: number,
  xhr: Parameters<typeof startXhrResponseHeadersCapture>[1] &
    Parameters<typeof startXhrResponseBodyCapture>[1],
  input: Readonly<{
    capture: RequestCaptureSnapshot;
    beginPendingWork: () => void;
    canEmitPendingOutput: () => boolean;
    emit: (
      event:
        | ReturnType<typeof createXhrResponseHeadersDetailEvent>
        | ReturnType<typeof createXhrResponseBodyCaptureTask>,
    ) => void;
    settlePendingWork: () => void;
  }>,
): void {
  if (input.capture.captureResponseHeaders) {
    startXhrResponseHeadersCapture(requestId, xhr, {
      ...input,
      redactionPatterns: input.capture.redactionPatterns,
    });
  }

  if (input.capture.captureResponseBody) {
    startXhrResponseBodyCapture(requestId, xhr, {
      ...input,
      bodyCaptureLimit: input.capture.bodyCaptureLimit,
      redactionPatterns: input.capture.redactionPatterns,
    });
  }
}
