import { createRequestBodyCaptureTask } from "./createRequestBodyCaptureTask.js";
import { startPendingDetailTask } from "./startPendingDetailTask.js";

/**
 * Starts one pending Request body capture operation.
 *
 * @param requestId - Session request identifier.
 * @param request - Application-owned Request to inspect through a clone.
 * @param capture - Request-scoped policy and pending-output operations.
 * @returns A promise that resolves after detail output and pending settlement.
 */
export function startRequestBodyCapture(
  requestId: number,
  request: Request,
  capture: Readonly<{
    bodyCaptureLimit: number;
    redactionPatterns: readonly string[];
    beginPendingWork: () => void;
    canEmitPendingOutput: () => boolean;
    emit: (
      event: Awaited<ReturnType<typeof createRequestBodyCaptureTask>>,
    ) => void;
    settlePendingWork: () => void;
  }>,
): Promise<void> {
  return startPendingDetailTask(
    () => {return createRequestBodyCaptureTask(requestId, request, capture)},
    capture,
  );
}
