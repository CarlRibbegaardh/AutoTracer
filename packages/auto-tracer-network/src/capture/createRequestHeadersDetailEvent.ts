import { createStructuredDetailEvent } from "../events/createStructuredDetailEvent.js";
import { redactHeaders } from "../redaction/redactHeaders.js";

/**
 * Creates a correlated request-header detail from script-visible headers.
 *
 * @param requestId - Session request identifier.
 * @param headers - Effective script-provided request headers.
 * @param redactionPatterns - Field-name patterns used to redact values.
 * @returns A detached structured request-header detail event.
 */
export function createRequestHeadersDetailEvent(
  requestId: number,
  headers: Headers,
  redactionPatterns: readonly string[],
) {
  const redactedHeaders = redactHeaders(headers, redactionPatterns);

  return createStructuredDetailEvent(
    requestId,
    "request headers",
    Object.fromEntries(redactedHeaders.entries()),
  );
}
