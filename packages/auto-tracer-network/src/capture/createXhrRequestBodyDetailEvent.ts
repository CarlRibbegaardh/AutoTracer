import { createBinaryBodySnapshot } from "../body/createBinaryBodySnapshot.js";
import { createStructuredDetailEvent } from "../events/createStructuredDetailEvent.js";
import { createRequestBodyDetailEvent } from "./createRequestBodyDetailEvent.js";
import { isXhrDocumentBody } from "./isXhrDocumentBody.js";

/**
 * Creates a request-body detail from one non-null native XHR body value.
 *
 * @param requestId - Session request identifier.
 * @param body - Script-provided XHR request body.
 * @param capture - Request-scoped media type, size limit, and redaction policy.
 * @returns A detached request-body detail event.
 */
export function createXhrRequestBodyDetailEvent(
  requestId: number,
  body: Document | XMLHttpRequestBodyInit,
  capture: Readonly<{
    contentType: string | null;
    bodyCaptureLimit: number;
    redactionPatterns: readonly string[];
  }>,
) {
  if (isXhrDocumentBody(body)) {
    return createStructuredDetailEvent(
      requestId,
      "request body",
      createBinaryBodySnapshot(capture.contentType, null),
    );
  }

  return createRequestBodyDetailEvent(requestId, body, capture);
}
