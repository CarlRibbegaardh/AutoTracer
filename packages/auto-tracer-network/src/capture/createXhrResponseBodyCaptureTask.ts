import { createUnavailableDetailEvent } from "../events/createUnavailableDetailEvent.js";
import { createXhrResponseBodyDetailEvent } from "./createXhrResponseBodyDetailEvent.js";

/**
 * Reads browser-visible XHR response data into a correlated detail event.
 *
 * @param requestId - Session request identifier.
 * @param xhr - XHR response value and header access operations.
 * @param capture - Request-scoped size limit and redaction policy.
 * @returns A body detail or unavailable detail when response access fails.
 */
export function createXhrResponseBodyCaptureTask(
  requestId: number,
  xhr: Readonly<{
    response: unknown;
    getResponseHeader: (name: string) => string | null;
  }>,
  capture: Readonly<{
    bodyCaptureLimit: number;
    redactionPatterns: readonly string[];
  }>,
) {
  try {
    return createXhrResponseBodyDetailEvent(requestId, xhr.response, {
      contentType: xhr.getResponseHeader("content-type"),
      bodyCaptureLimit: capture.bodyCaptureLimit,
      redactionPatterns: capture.redactionPatterns,
    });
  } catch {
    return createUnavailableDetailEvent(requestId, "response body");
  }
}
