import { createBodySnapshot } from "../body/createBodySnapshot.js";
import { createStructuredDetailEvent } from "../events/createStructuredDetailEvent.js";

/**
 * Creates a correlated response-body detail from a script-visible body value.
 *
 * @param requestId - Session request identifier.
 * @param body - Script-visible response body value.
 * @param capture - Request-scoped media type, size limit, and redaction policy.
 * @returns A detached structured response-body detail event.
 */
export function createResponseBodyDetailEvent(
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
    "response body",
    createBodySnapshot({
      body,
      contentType: capture.contentType,
      captureLimit: capture.bodyCaptureLimit,
      redactionPatterns: capture.redactionPatterns,
    }),
  );
}
