import { createResponseBodyCaptureTask } from "./createResponseBodyCaptureTask.js";
import { startPendingDetailTask } from "./startPendingDetailTask.js";

/**
 * Starts one pending Response body capture operation.
 *
 * @param requestId - Session request identifier.
 * @param response - Application-owned Response to inspect through a clone.
 * @param capture - Request-scoped policy and pending-output operations.
 * @returns A promise that resolves after detail output and pending settlement.
 */
export function startResponseBodyCapture(
  requestId: number,
  response: Response,
  capture: Readonly<{
    bodyCaptureLimit: number;
    redactionPatterns: readonly string[];
    beginPendingWork: () => void;
    canEmitPendingOutput: () => boolean;
    emit: (
      event: Awaited<ReturnType<typeof createResponseBodyCaptureTask>>,
    ) => void;
    settlePendingWork: () => void;
  }>,
): Promise<void> {
  return startPendingDetailTask(
    () => {return createResponseBodyCaptureTask(requestId, response, capture)},
    capture,
  );
}
