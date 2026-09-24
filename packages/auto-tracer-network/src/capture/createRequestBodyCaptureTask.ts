import { createUnavailableDetailEvent } from "../events/createUnavailableDetailEvent.js";
import { getHeaderContentType } from "../transport/getHeaderContentType.js";
import { cloneRequestForBodyCapture } from "./cloneRequestForBodyCapture.js";
import { createRequestBodyDetailEvent } from "./createRequestBodyDetailEvent.js";

/**
 * Reads a cloned Request body into a correlated detail event.
 *
 * @param requestId - Session request identifier.
 * @param request - Application-owned Request to clone without reading.
 * @param capture - Request-scoped size limit and redaction policy.
 * @returns A body detail or unavailable detail without consuming the original Request.
 */
export async function createRequestBodyCaptureTask(
  requestId: number,
  request: Request,
  capture: Readonly<{
    bodyCaptureLimit: number;
    redactionPatterns: readonly string[];
  }>,
) {
  const clone = cloneRequestForBodyCapture(request);
  if (clone === undefined) {
    return createUnavailableDetailEvent(requestId, "request body");
  }

  try {
    const body = await clone.text();
    return createRequestBodyDetailEvent(requestId, body, {
      contentType: getHeaderContentType(clone.headers),
      bodyCaptureLimit: capture.bodyCaptureLimit,
      redactionPatterns: capture.redactionPatterns,
    });
  } catch {
    return createUnavailableDetailEvent(requestId, "request body");
  }
}
