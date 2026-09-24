import { createXhrResponseBodyCaptureTask } from "./createXhrResponseBodyCaptureTask.js";
import { runPendingDetailCapture } from "./runPendingDetailCapture.js";

/**
 * Captures browser-visible XHR response data as pending detail work.
 *
 * @param requestId - Session request identifier.
 * @param xhr - XHR response value and header access operations.
 * @param capture - Request-scoped policy and pending-output operations.
 */
export function startXhrResponseBodyCapture(
  requestId: number,
  xhr: Parameters<typeof createXhrResponseBodyCaptureTask>[1],
  capture: Parameters<typeof createXhrResponseBodyCaptureTask>[2] &
    Readonly<{
      beginPendingWork: () => void;
      canEmitPendingOutput: () => boolean;
      emit: (
        event: ReturnType<typeof createXhrResponseBodyCaptureTask>,
      ) => void;
      settlePendingWork: () => void;
    }>,
): void {
  runPendingDetailCapture(
    () => {return createXhrResponseBodyCaptureTask(requestId, xhr, capture)},
    capture,
  );
}
