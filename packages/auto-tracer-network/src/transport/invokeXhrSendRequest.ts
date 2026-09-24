import { applyNetworkRequestAdmission } from "../automatic-stop/applyNetworkRequestAdmission.js";
import { createRequestCaptureSnapshot } from "../capture/createRequestCaptureSnapshot.js";
import { startXhrRequestDetails } from "../capture/startXhrRequestDetails.js";
import { startXhrResponseDetails } from "../capture/startXhrResponseDetails.js";
import type { NetworkTracerConfig } from "../configuration/NetworkTracerConfig.js";
import { allocateXhrSendAdmission } from "./allocateXhrSendAdmission.js";
import { createXhrSendMetadata } from "./createXhrSendMetadata.js";
import { invokeXhrSendByAdmission } from "./invokeXhrSendByAdmission.js";
import type { XhrOpenMetadata } from "./XhrOpenMetadata.js";

/**
 * Invokes one XHR send according to live tracer state and request admission.
 *
 * @param nativeSend - Bound native XHR send implementation.
 * @param request - XHR instance and original send arguments.
 * @param runtime - Live configuration, identity, state, timing, and output operations.
 */
export function invokeXhrSendRequest(
  nativeSend: Parameters<typeof invokeXhrSendByAdmission>[0],
  request: Parameters<typeof invokeXhrSendByAdmission>[1] &
    Readonly<{
      xhr: Readonly<
        Pick<XMLHttpRequest, "getAllResponseHeaders" | "getResponseHeader"> & {
          response: unknown;
        }
      >;
    }>,
  runtime: Readonly<{
    isEnabled: () => boolean;
    baseUrl: string;
    getConfig: () => NetworkTracerConfig;
    getOpenMetadata: () => XhrOpenMetadata | undefined;
    getRequestHeaders: () => Headers;
    getNextRequestId: () => number;
    getAdmittedRequestCount: () => number;
    setAdmittedRequestCount: (count: number) => void;
    enterStopping: (requestLimit: number) => void;
    getMonotonicMarker: () => number;
    beginPendingWork: () => void;
    canEmitPendingOutput: () => boolean;
    settlePendingWork: () => void;
    emit: Extract<
      Parameters<typeof invokeXhrSendByAdmission>[2],
      { admitted: true }
    >["emit"];
    setActiveRequest: Extract<
      Parameters<typeof invokeXhrSendByAdmission>[2],
      { admitted: true }
    >["setActiveRequest"];
  }>,
): void {
  if (!runtime.isEnabled()) {
    nativeSend(...request.args);
    return;
  }

  const openMetadata = runtime.getOpenMetadata();
  if (openMetadata === undefined) {
    nativeSend(...request.args);
    return;
  }

  const metadata = createXhrSendMetadata(openMetadata);
  const config = runtime.getConfig();
  const admission = allocateXhrSendAdmission(
    runtime.getNextRequestId,
    metadata,
    {
      baseUrl: runtime.baseUrl,
      redactionPatterns: config.redactionPatterns,
      includePatterns: config.includePatterns,
      excludePatterns: config.excludePatterns,
      admittedRequestCount: runtime.getAdmittedRequestCount(),
      autoStopLimit: config.autoStopAfterRequests,
    },
  );

  applyNetworkRequestAdmission(
    admission,
    runtime.setAdmittedRequestCount,
    runtime.enterStopping,
  );

  if (!admission.admitted) {
    invokeXhrSendByAdmission(nativeSend, request, { admitted: false });
    return;
  }

  const capture = createRequestCaptureSnapshot(config);
  const requestHeaders = runtime.getRequestHeaders();

  invokeXhrSendByAdmission(nativeSend, request, {
    admitted: true,
    requestId: admission.requestId,
    method: metadata.method,
    requestedUrl: admission.requestedUrl,
    normalizedRequestedUrl: admission.normalizedRequestedUrl,
    startMarker: runtime.getMonotonicMarker(),
    getCompletionMarker: runtime.getMonotonicMarker,
    beginPendingWork: runtime.beginPendingWork,
    canEmitPendingOutput: runtime.canEmitPendingOutput,
    startRequestDetails: () =>
      {return startXhrRequestDetails(
        admission.requestId,
        { headers: requestHeaders, body: request.args[0] ?? null },
        {
          capture,
          beginPendingWork: runtime.beginPendingWork,
          canEmitPendingOutput: runtime.canEmitPendingOutput,
          emit: runtime.emit,
          settlePendingWork: runtime.settlePendingWork,
        },
      )},
    startResponseDetails: () =>
      {return startXhrResponseDetails(admission.requestId, request.xhr, {
        capture,
        beginPendingWork: runtime.beginPendingWork,
        canEmitPendingOutput: runtime.canEmitPendingOutput,
        emit: runtime.emit,
        settlePendingWork: runtime.settlePendingWork,
      })},
    settlePendingWork: runtime.settlePendingWork,
    emit: runtime.emit,
    setActiveRequest: runtime.setActiveRequest,
  });
}
