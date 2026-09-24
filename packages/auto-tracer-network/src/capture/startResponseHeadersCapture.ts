import { createResponseHeadersDetailEvent } from "./createResponseHeadersDetailEvent.js";
import { runPendingDetailCapture } from "./runPendingDetailCapture.js";

/**
 * Captures one pending response-header detail synchronously.
 *
 * @param requestId - Session request identifier.
 * @param response - Application-visible Fetch response.
 * @param capture - Request-scoped redaction and pending-output operations.
 */
export function startResponseHeadersCapture(
  requestId: number,
  response: Response,
  capture: Readonly<{
    redactionPatterns: readonly string[];
    beginPendingWork: () => void;
    canEmitPendingOutput: () => boolean;
    emit: (event: ReturnType<typeof createResponseHeadersDetailEvent>) => void;
    settlePendingWork: () => void;
  }>,
): void {
  runPendingDetailCapture(
    () =>
      {return createResponseHeadersDetailEvent(
        requestId,
        response,
        capture.redactionPatterns,
      )},
    capture,
  );
}
