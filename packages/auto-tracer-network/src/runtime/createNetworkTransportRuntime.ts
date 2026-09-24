import type { NetworkTracerConfigStore } from "../configuration/NetworkTracerConfigStore.js";
import type { IncludedRequestCountStore } from "../identity/IncludedRequestCountStore.js";
import type { RequestIdStore } from "../identity/RequestIdStore.js";
import type { createNetworkEventArguments } from "../output/createNetworkEventArguments.js";
import { canEmitPendingOutput } from "../state/canEmitPendingOutput.js";
import type { NetworkTracerStateStore } from "../state/NetworkTracerStateStore.js";

/**
 * Composes the live dependencies shared by Fetch and XHR request handlers.
 *
 * @param dependencies - Runtime stores, lifecycle commands, environment values, and output sink.
 * @returns Live transport operations backed by the supplied runtime dependencies.
 */
export function createNetworkTransportRuntime(
  dependencies: Readonly<{
    stateStore: NetworkTracerStateStore;
    configStore: NetworkTracerConfigStore;
    requestIds: RequestIdStore;
    admittedRequests: IncludedRequestCountStore;
    commands: Readonly<{
      enterAutomaticStopping: (requestLimit: number) => void;
      settlePendingWork: () => void;
    }>;
    baseUrl: string;
    getMonotonicMarker: () => number;
    emit: (event: Parameters<typeof createNetworkEventArguments>[0]) => void;
  }>,
): Readonly<{
  baseUrl: string;
  isEnabled: () => boolean;
  canEmitPendingOutput: () => boolean;
  getConfig: NetworkTracerConfigStore["getConfig"];
  getNextRequestId: RequestIdStore["getNextRequestId"];
  getAdmittedRequestCount: IncludedRequestCountStore["getAdmittedRequestCount"];
  setAdmittedRequestCount: IncludedRequestCountStore["setAdmittedRequestCount"];
  enterStopping: (requestLimit: number) => void;
  getMonotonicMarker: () => number;
  beginPendingWork: NetworkTracerStateStore["beginPendingWork"];
  settlePendingWork: () => void;
  emit: (event: Parameters<typeof createNetworkEventArguments>[0]) => void;
}> {
  return {
    baseUrl: dependencies.baseUrl,
    isEnabled: dependencies.stateStore.isEnabled,
    canEmitPendingOutput: () =>
      {return canEmitPendingOutput(dependencies.stateStore.getState())},
    getConfig: dependencies.configStore.getConfig,
    getNextRequestId: dependencies.requestIds.getNextRequestId,
    getAdmittedRequestCount:
      dependencies.admittedRequests.getAdmittedRequestCount,
    setAdmittedRequestCount:
      dependencies.admittedRequests.setAdmittedRequestCount,
    enterStopping: dependencies.commands.enterAutomaticStopping,
    getMonotonicMarker: dependencies.getMonotonicMarker,
    beginPendingWork: dependencies.stateStore.beginPendingWork,
    settlePendingWork: dependencies.commands.settlePendingWork,
    emit: dependencies.emit,
  };
}
