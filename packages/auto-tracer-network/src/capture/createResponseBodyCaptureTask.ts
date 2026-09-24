import { createUnavailableDetailEvent } from "../events/createUnavailableDetailEvent.js";
import { getHeaderContentType } from "../transport/getHeaderContentType.js";
import { cloneResponseForBodyCapture } from "./cloneResponseForBodyCapture.js";
import { createResponseBodyDetailEvent } from "./createResponseBodyDetailEvent.js";

/**
 * Reads a cloned Response body into a correlated detail event.
 *
 * @param requestId - Session request identifier.
 * @param response - Application-owned Response to clone without reading.
 * @param capture - Request-scoped size limit and redaction policy.
 * @returns A body detail or unavailable detail without consuming the original Response.
 */
export async function createResponseBodyCaptureTask(
  requestId: number,
  response: Response,
  capture: Readonly<{
    bodyCaptureLimit: number;
    redactionPatterns: readonly string[];
  }>,
) {
  const clone = cloneResponseForBodyCapture(response);
  if (clone === undefined) {
    return createUnavailableDetailEvent(requestId, "response body");
  }

  try {
    const body = await clone.text();
    return createResponseBodyDetailEvent(requestId, body, {
      contentType: getHeaderContentType(clone.headers),
      bodyCaptureLimit: capture.bodyCaptureLimit,
      redactionPatterns: capture.redactionPatterns,
    });
  } catch {
    return createUnavailableDetailEvent(requestId, "response body");
  }
}
