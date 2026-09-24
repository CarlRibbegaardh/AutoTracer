import { createBinaryBodySnapshot } from "../body/createBinaryBodySnapshot.js";
import { createUnavailableDetailEvent } from "../events/createUnavailableDetailEvent.js";
import { createStructuredDetailEvent } from "../events/createStructuredDetailEvent.js";
import { createResponseBodyDetailEvent } from "./createResponseBodyDetailEvent.js";
import { isXhrDocumentBody } from "./isXhrDocumentBody.js";

/**
 * Creates a response-body detail from a browser-visible XHR response value.
 *
 * @param requestId - Session request identifier.
 * @param response - Browser-visible XHR response value.
 * @param capture - Request-scoped media type, size limit, and redaction policy.
 * @returns A detached response-body detail or unavailable event.
 */
export function createXhrResponseBodyDetailEvent(
  requestId: number,
  response: unknown,
  capture: Readonly<{
    contentType: string | null;
    bodyCaptureLimit: number;
    redactionPatterns: readonly string[];
  }>,
) {
  if (
    typeof response === "string" ||
    response instanceof Blob ||
    response instanceof ArrayBuffer
  ) {
    return createResponseBodyDetailEvent(requestId, response, capture);
  }

  if (isXhrDocumentBody(response)) {
    return createStructuredDetailEvent(
      requestId,
      "response body",
      createBinaryBodySnapshot(capture.contentType, null),
    );
  }

  return createUnavailableDetailEvent(requestId, "response body");
}
