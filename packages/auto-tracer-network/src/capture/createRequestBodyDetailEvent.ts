import { createBodySnapshot } from "../body/createBodySnapshot.js";
import { createStructuredDetailEvent } from "../events/createStructuredDetailEvent.js";

/**
 * Creates a correlated request-body detail from a script-visible body value.
 *
 * @param requestId - Session request identifier.
 * @param body - Script-visible request body value.
 * @param capture - Request-scoped media type, size limit, and redaction policy.
 * @returns A detached structured request-body detail event.
 */
export function createRequestBodyDetailEvent(
  requestId: number,
  body: BodyInit,
  capture: Readonly<{
    contentType: string | null;
    bodyCaptureLimit: number;
    redactionPatterns: readonly string[];
  }>,
) {
  return createStructuredDetailEvent(
    requestId,
    "request body",
    createBodySnapshot({
      body,
      contentType: capture.contentType,
      captureLimit: capture.bodyCaptureLimit,
      redactionPatterns: capture.redactionPatterns,
    }),
  );
}
