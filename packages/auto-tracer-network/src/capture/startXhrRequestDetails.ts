import { getHeaderContentType } from "../transport/getHeaderContentType.js";
import { createRequestHeadersDetailEvent } from "./createRequestHeadersDetailEvent.js";
import { createXhrRequestBodyDetailEvent } from "./createXhrRequestBodyDetailEvent.js";
import type { RequestCaptureSnapshot } from "./RequestCaptureSnapshot.js";
import { runPendingDetailCapture } from "./runPendingDetailCapture.js";
import { startRequestHeadersCapture } from "./startRequestHeadersCapture.js";

/**
 * Starts every enabled request detail for one admitted XHR invocation.
 *
 * @param requestId - Session request identifier.
 * @param request - Snapshotted request headers and script-provided body.
 * @param input - Request-scoped capture policy and pending-output operations.
 */
export function startXhrRequestDetails(
  requestId: number,
  request: Readonly<{
    headers: Headers;
    body: Document | XMLHttpRequestBodyInit | null;
  }>,
  input: Readonly<{
    capture: RequestCaptureSnapshot;
    beginPendingWork: () => void;
    canEmitPendingOutput: () => boolean;
    emit: (
      event:
        | ReturnType<typeof createRequestHeadersDetailEvent>
        | ReturnType<typeof createXhrRequestBodyDetailEvent>,
    ) => void;
    settlePendingWork: () => void;
  }>,
): void {
  if (input.capture.captureRequestHeaders) {
    startRequestHeadersCapture(requestId, request.headers, {
      ...input,
      redactionPatterns: input.capture.redactionPatterns,
    });
  }

  const body = request.body;
  if (!input.capture.captureRequestBody || body === null) return;

  runPendingDetailCapture(
    () =>
      {return createXhrRequestBodyDetailEvent(requestId, body, {
        contentType: getHeaderContentType(request.headers),
        bodyCaptureLimit: input.capture.bodyCaptureLimit,
        redactionPatterns: input.capture.redactionPatterns,
      })},
    input,
  );
}
