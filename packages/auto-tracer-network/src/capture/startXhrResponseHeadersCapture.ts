import { createXhrResponseHeadersDetailEvent } from "./createXhrResponseHeadersDetailEvent.js";
import { createXhrResponseHeadersSnapshot } from "./createXhrResponseHeadersSnapshot.js";
import { runPendingDetailCapture } from "./runPendingDetailCapture.js";

/**
 * Captures browser-exposed XHR response headers as pending detail work.
 *
 * @param requestId - Session request identifier.
 * @param xhr - XHR response-header access operation.
 * @param capture - Request-scoped redaction and pending-output operations.
 */
export function startXhrResponseHeadersCapture(
  requestId: number,
  xhr: Readonly<Pick<XMLHttpRequest, "getAllResponseHeaders">>,
  capture: Readonly<{
    redactionPatterns: readonly string[];
    beginPendingWork: () => void;
    canEmitPendingOutput: () => boolean;
    emit: (event: ReturnType<typeof createXhrResponseHeadersDetailEvent>) => void;
    settlePendingWork: () => void;
  }>,
): void {
  runPendingDetailCapture(
    () =>
      {return createXhrResponseHeadersDetailEvent(
        requestId,
        createXhrResponseHeadersSnapshot(xhr.getAllResponseHeaders()),
        capture.redactionPatterns,
      )},
    capture,
  );
}
