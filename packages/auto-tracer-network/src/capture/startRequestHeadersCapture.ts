import { createRequestHeadersDetailEvent } from "./createRequestHeadersDetailEvent.js";
import { runPendingDetailCapture } from "./runPendingDetailCapture.js";

/**
 * Captures one pending request-header detail synchronously.
 *
 * @param requestId - Session request identifier.
 * @param headers - Effective script-provided request headers.
 * @param capture - Request-scoped redaction and pending-output operations.
 */
export function startRequestHeadersCapture(
  requestId: number,
  headers: Headers,
  capture: Readonly<{
    redactionPatterns: readonly string[];
    beginPendingWork: () => void;
    canEmitPendingOutput: () => boolean;
    emit: (event: ReturnType<typeof createRequestHeadersDetailEvent>) => void;
    settlePendingWork: () => void;
  }>,
): void {
  runPendingDetailCapture(
    () =>
      {return createRequestHeadersDetailEvent(
        requestId,
        headers,
        capture.redactionPatterns,
      )},
    capture,
  );
}
