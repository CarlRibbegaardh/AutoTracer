import { applyNetworkRequestAdmission } from "../automatic-stop/applyNetworkRequestAdmission.js";
import { createRequestCaptureSnapshot } from "../capture/createRequestCaptureSnapshot.js";
import { startFetchRequestDetails } from "../capture/startFetchRequestDetails.js";
import { startFetchResponseDetails } from "../capture/startFetchResponseDetails.js";
import type { NetworkTracerConfig } from "../configuration/NetworkTracerConfig.js";
import { allocateFetchRequestAdmission } from "./allocateFetchRequestAdmission.js";
import { createFetchRequestMetadata } from "./createFetchRequestMetadata.js";
import { invokeFetchByAdmission } from "./invokeFetchByAdmission.js";
import { invokeNativeFetch } from "./invokeNativeFetch.js";

/**
 * Executes one Fetch call according to live runtime state and admission policy.
 *
 * @param nativeFetch - Native Fetch implementation captured at installation.
 * @param request - Original Fetch input and initialization values.
 * @param runtime - Live state, configuration, identity, timing, and output operations.
 * @returns The exact promise returned by the native Fetch implementation.
 */
export function invokeFetchRequest(
  nativeFetch: Parameters<typeof invokeFetchByAdmission>[0],
  request: Parameters<typeof invokeFetchByAdmission>[1],
  runtime: Readonly<{
    isEnabled: () => boolean;
    baseUrl: string;
    getConfig: () => NetworkTracerConfig;
    getNextRequestId: () => number;
    getAdmittedRequestCount: () => number;
    setAdmittedRequestCount: (count: number) => void;
    enterStopping: (requestLimit: number) => void;
    getMonotonicMarker: () => number;
    beginPendingWork: () => void;
    canEmitPendingOutput: () => boolean;
    settlePendingWork: () => void;
    emit: (
      event:
        | Parameters<
            Parameters<typeof invokeFetchByAdmission>[2]["emit"]
          >[0]
        | Parameters<
            Parameters<typeof startFetchRequestDetails>[2]["emit"]
          >[0]
        | Parameters<
            Parameters<typeof startFetchResponseDetails>[2]["emit"]
          >[0],
    ) => void;
  }>,
): Promise<Response> {
  if (!runtime.isEnabled()) {
    return invokeNativeFetch(nativeFetch, request);
  }

  const config = runtime.getConfig();
  const admission = allocateFetchRequestAdmission(
    runtime.getNextRequestId,
    request.input,
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
    return invokeNativeFetch(nativeFetch, request);
  }

  const metadata = createFetchRequestMetadata(request.input, request.init);
  const capture = createRequestCaptureSnapshot(config);

  return invokeFetchByAdmission(nativeFetch, request, {
    admitted: true,
    requestId: admission.requestId,
    method: metadata.method,
    requestedUrl: admission.requestedUrl,
    startMarker: runtime.getMonotonicMarker(),
    getCompletionMarker: runtime.getMonotonicMarker,
    beginPendingWork: runtime.beginPendingWork,
    startRequestDetails: () =>
      {return startFetchRequestDetails(admission.requestId, request, {
        metadata,
        capture,
        beginPendingWork: runtime.beginPendingWork,
        canEmitPendingOutput: runtime.canEmitPendingOutput,
        emit: runtime.emit,
        settlePendingWork: runtime.settlePendingWork,
      })},
    startResponseDetails: (response) =>
      {return startFetchResponseDetails(admission.requestId, response, {
        capture,
        beginPendingWork: runtime.beginPendingWork,
        canEmitPendingOutput: runtime.canEmitPendingOutput,
        emit: runtime.emit,
        settlePendingWork: runtime.settlePendingWork,
      })},
    canEmitPendingOutput: runtime.canEmitPendingOutput,
    settlePendingWork: runtime.settlePendingWork,
    emit: runtime.emit,
  });
}
