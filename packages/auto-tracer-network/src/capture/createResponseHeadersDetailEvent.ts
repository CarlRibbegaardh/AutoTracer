import { createStructuredDetailEvent } from "../events/createStructuredDetailEvent.js";
import { redactHeaders } from "../redaction/redactHeaders.js";
import { createResponseHeadersSnapshot } from "./createResponseHeadersSnapshot.js";

/**
 * Creates a correlated response-header detail from browser-visible headers.
 *
 * @param requestId - Session request identifier.
 * @param response - Application-visible Fetch response.
 * @param redactionPatterns - Field-name patterns used to redact values.
 * @returns A detached structured response-header detail event.
 */
export function createResponseHeadersDetailEvent(
  requestId: number,
  response: Response,
  redactionPatterns: readonly string[],
) {
  const responseHeaders = createResponseHeadersSnapshot(response);
  const redactedHeaders = redactHeaders(responseHeaders, redactionPatterns);

  return createStructuredDetailEvent(
    requestId,
    "response headers",
    Object.fromEntries(redactedHeaders.entries()),
  );
}
