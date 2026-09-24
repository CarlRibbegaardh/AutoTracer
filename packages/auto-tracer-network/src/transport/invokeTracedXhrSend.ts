import { createXhrSynchronousFailureObserver } from "./createXhrSynchronousFailureObserver.js";
import { createRequestHeadersDetailEvent } from "../capture/createRequestHeadersDetailEvent.js";
import { createXhrRequestBodyDetailEvent } from "../capture/createXhrRequestBodyDetailEvent.js";
import { createXhrResponseBodyCaptureTask } from "../capture/createXhrResponseBodyCaptureTask.js";
import { createXhrResponseHeadersDetailEvent } from "../capture/createXhrResponseHeadersDetailEvent.js";
import { invokeObservedXhrSend } from "./invokeObservedXhrSend.js";
import { startTracedXhrRequest } from "./startTracedXhrRequest.js";

/**
 * Invokes one admitted XHR send with correlated lifecycle observation.
 *
 * @param nativeSend - Bound native XHR send implementation.
 * @param request - XHR instance and original send arguments.
 * @param trace - Request identity, timing, state, and output operations.
 */
export function invokeTracedXhrSend(
  nativeSend: Parameters<typeof invokeObservedXhrSend>[0],
  request: Readonly<{
    xhr: Parameters<typeof startTracedXhrRequest>[0];
    args: Parameters<typeof invokeObservedXhrSend>[1];
  }>,
  trace: Readonly<{
    requestId: number;
    method: string;
    requestedUrl: string;
    normalizedRequestedUrl: string;
    startMarker: number;
    getCompletionMarker: () => number;
    beginPendingWork: () => void;
    canEmitPendingOutput: () => boolean;
    settlePendingWork: () => void;
    emit: (
      event:
        | Parameters<
            Parameters<typeof startTracedXhrRequest>[1]["emit"]
          >[0]
        | Parameters<
            Parameters<typeof createXhrSynchronousFailureObserver>[2]
          >[0]
        | ReturnType<typeof createRequestHeadersDetailEvent>
        | ReturnType<typeof createXhrRequestBodyDetailEvent>
        | ReturnType<typeof createXhrResponseBodyCaptureTask>
        | ReturnType<typeof createXhrResponseHeadersDetailEvent>,
    ) => void;
    setActiveRequest: (
      request: ReturnType<typeof startTracedXhrRequest>,
    ) => void;
    startRequestDetails?: () => void;
    startResponseDetails?: () => void;
  }>,
): void {
  const activeRequest = startTracedXhrRequest(request.xhr, trace);
  trace.setActiveRequest(activeRequest);
  trace.startRequestDetails?.();

  invokeObservedXhrSend(
    nativeSend,
    request.args,
    createXhrSynchronousFailureObserver(
      activeRequest,
      trace.getCompletionMarker,
      trace.emit,
    ),
  );
}
