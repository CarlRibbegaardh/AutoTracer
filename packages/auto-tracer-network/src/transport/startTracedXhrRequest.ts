import { createRequestStartEvent } from "../events/createRequestStartEvent.js";
import { createXhrResponseBodyCaptureTask } from "../capture/createXhrResponseBodyCaptureTask.js";
import { createXhrResponseHeadersDetailEvent } from "../capture/createXhrResponseHeadersDetailEvent.js";
import { createTerminalOutcomeGate } from "../outcomes/createTerminalOutcomeGate.js";
import { createXhrTerminalEvent } from "./createXhrTerminalEvent.js";
import { createXhrTerminalObservers } from "./createXhrTerminalObservers.js";
import { registerXhrTerminalListeners } from "./registerXhrTerminalListeners.js";

/**
 * Starts lifecycle observation for one admitted XHR request.
 *
 * @param xhr - XHR terminal state and native event target.
 * @param trace - Request identity, timing, output, and pending-work operations.
 * @returns Active request data used for completion or replacement cleanup.
 */
export function startTracedXhrRequest(
  xhr: Parameters<typeof createXhrTerminalObservers>[0] &
    Parameters<typeof registerXhrTerminalListeners>[0],
  trace: Readonly<{
    requestId: number;
    method: string;
    requestedUrl: string;
    normalizedRequestedUrl: string;
    startMarker: number;
    getCompletionMarker: () => number;
    beginPendingWork: () => void;
    canEmitPendingOutput: () => boolean;
    startResponseDetails?: () => void;
    settlePendingWork: () => void;
    emit: (
      event:
        | ReturnType<typeof createRequestStartEvent>
        | ReturnType<typeof createXhrTerminalEvent>
        | ReturnType<typeof createXhrResponseBodyCaptureTask>
        | ReturnType<typeof createXhrResponseHeadersDetailEvent>,
    ) => void;
  }>,
): Readonly<{
  requestId: number;
  method: string;
  requestedUrl: string;
  startMarker: number;
  claimTerminalOutcome: () => boolean;
  settlePendingWork: () => void;
  removeTerminalListeners: () => void;
}> {
  const claimTerminalOutcome = createTerminalOutcomeGate();
  const observers = createXhrTerminalObservers(xhr, {
    ...trace,
    claimTerminalOutcome,
  });

  trace.beginPendingWork();
  trace.emit(
    createRequestStartEvent(trace.requestId, trace.method, trace.requestedUrl),
  );
  const removeTerminalListeners = registerXhrTerminalListeners(xhr, observers);

  return {
    requestId: trace.requestId,
    method: trace.method,
    requestedUrl: trace.requestedUrl,
    startMarker: trace.startMarker,
    claimTerminalOutcome,
    settlePendingWork: trace.settlePendingWork,
    removeTerminalListeners,
  };
}
