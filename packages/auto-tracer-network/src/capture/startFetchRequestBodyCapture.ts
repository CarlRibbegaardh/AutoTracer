import { createRequestBodyDetailEvent } from "./createRequestBodyDetailEvent.js";
import { createRequestBodyCaptureTask } from "./createRequestBodyCaptureTask.js";
import { runPendingDetailCapture } from "./runPendingDetailCapture.js";
import { startRequestBodyCapture } from "./startRequestBodyCapture.js";

/**
 * Starts capture for the effective body of one Fetch invocation.
 *
 * @param requestId - Session request identifier.
 * @param request - Original Fetch input and initialization values.
 * @param capture - Effective media type, policy, and pending-output operations.
 * @returns A promise that resolves after any asynchronous Request capture settles.
 */
export function startFetchRequestBodyCapture(
  requestId: number,
  request: Readonly<{ input: RequestInfo | URL; init?: RequestInit }>,
  capture: Readonly<{
    contentType: string | null;
    bodyCaptureLimit: number;
    redactionPatterns: readonly string[];
    beginPendingWork: () => void;
    canEmitPendingOutput: () => boolean;
    emit: (
      event:
        | ReturnType<typeof createRequestBodyDetailEvent>
        | Awaited<ReturnType<typeof createRequestBodyCaptureTask>>,
    ) => void;
    settlePendingWork: () => void;
  }>,
): Promise<void> {
  const initializerBody = request.init?.body;
  if (initializerBody !== undefined && initializerBody !== null) {
    runPendingDetailCapture(
      () => {return createRequestBodyDetailEvent(requestId, initializerBody, capture)},
      capture,
    );
    return Promise.resolve();
  }

  if (request.input instanceof Request && request.input.body !== null) {
    return startRequestBodyCapture(requestId, request.input, capture);
  }

  return Promise.resolve();
}
