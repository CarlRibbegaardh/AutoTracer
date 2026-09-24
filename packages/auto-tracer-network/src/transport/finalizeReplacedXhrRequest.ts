import { createAbortedCompletionEvent } from "../events/createAbortedCompletionEvent.js";
import { calculateElapsedDuration } from "../timing/calculateElapsedDuration.js";

/**
 * Finalizes one active XHR request replaced by a later open invocation.
 *
 * @param request - Active request identity and terminal operations.
 * @param completionMarker - Monotonic marker captured at replacement.
 * @param emit - Emits the replacement abort event.
 */
export function finalizeReplacedXhrRequest(
  request: Readonly<{
    requestId: number;
    method: string;
    requestedUrl: string;
    startMarker: number;
    claimTerminalOutcome: () => boolean;
    settlePendingWork: () => void;
  }>,
  completionMarker: number,
  emit: (event: ReturnType<typeof createAbortedCompletionEvent>) => void,
): void {
  if (!request.claimTerminalOutcome()) {
    return;
  }

  try {
    emit(
      createAbortedCompletionEvent({
        requestId: request.requestId,
        method: request.method,
        url: request.requestedUrl,
        elapsedMilliseconds: calculateElapsedDuration(
          request.startMarker,
          completionMarker,
        ),
      }),
    );
  } catch {
    // Tracing output must not alter native XHR behavior.
  } finally {
    request.settlePendingWork();
  }
}
