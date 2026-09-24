import { createStructuredDetailEvent } from "../events/createStructuredDetailEvent.js";
import { redactHeaders } from "../redaction/redactHeaders.js";

/**
 * Creates a correlated response-header detail from XHR-exposed headers.
 *
 * @param requestId - Session request identifier.
 * @param headers - Detached browser-exposed response headers.
 * @param redactionPatterns - Field-name patterns used to redact values.
 * @returns A detached structured response-header detail event.
 */
export function createXhrResponseHeadersDetailEvent(
  requestId: number,
  headers: Headers,
  redactionPatterns: readonly string[],
) {
  const redactedHeaders = redactHeaders(headers, redactionPatterns);

  return createStructuredDetailEvent(
    requestId,
    "response headers",
    Object.fromEntries(redactedHeaders.entries()),
  );
}
