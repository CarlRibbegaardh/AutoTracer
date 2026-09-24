import type { FetchRequestMetadata } from "../transport/FetchRequestMetadata.js";
import type { RequestCaptureSnapshot } from "./RequestCaptureSnapshot.js";
import { createRequestBodyCaptureTask } from "./createRequestBodyCaptureTask.js";
import { createRequestHeadersDetailEvent } from "./createRequestHeadersDetailEvent.js";
import { startFetchRequestBodyCapture } from "./startFetchRequestBodyCapture.js";
import { startRequestHeadersCapture } from "./startRequestHeadersCapture.js";

/**
 * Starts every enabled request detail for one admitted Fetch invocation.
 *
 * @param requestId - Session request identifier.
 * @param request - Original Fetch input and initialization values.
 * @param input - Request metadata, capture snapshot, and pending-output operations.
 */
export function startFetchRequestDetails(
  requestId: number,
  request: Readonly<{ input: RequestInfo | URL; init?: RequestInit }>,
  input: Readonly<{
    metadata: FetchRequestMetadata;
    capture: RequestCaptureSnapshot;
    beginPendingWork: () => void;
    canEmitPendingOutput: () => boolean;
    emit: (
      event:
        | ReturnType<typeof createRequestHeadersDetailEvent>
        | Awaited<ReturnType<typeof createRequestBodyCaptureTask>>,
    ) => void;
    settlePendingWork: () => void;
  }>,
): void {
  if (input.capture.captureRequestHeaders) {
    startRequestHeadersCapture(requestId, input.metadata.headers, {
      ...input,
      redactionPatterns: input.capture.redactionPatterns,
    });
  }

  if (input.capture.captureRequestBody) {
    void startFetchRequestBodyCapture(requestId, request, {
      ...input,
      contentType: input.metadata.contentType,
      bodyCaptureLimit: input.capture.bodyCaptureLimit,
      redactionPatterns: input.capture.redactionPatterns,
    });
  }
}
