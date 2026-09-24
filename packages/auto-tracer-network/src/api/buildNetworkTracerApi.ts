import type { NetworkTracerStateStore } from "../state/NetworkTracerStateStore.js";
import type { NetworkTracerApi } from "./NetworkTracerApi.js";
import type { NetworkTracerConfigApi } from "./NetworkTracerConfigApi.js";

/**
 * Builds the public NetworkTracer API from lifecycle, state, and configuration controls.
 *
 * @param commands - Lifecycle commands exposed by the runtime.
 * @param state - Live lifecycle state queries.
 * @param configApi - Live configuration controls.
 * @returns The combined public NetworkTracer control surface.
 */
export function buildNetworkTracerApi(
  commands: Readonly<{
    start: () => void;
    stop: () => void;
    forceStop: () => void;
  }>,
  state: Pick<
    NetworkTracerStateStore,
    "isEnabled" | "getState" | "getPendingRequestCount"
  >,
  configApi: NetworkTracerConfigApi,
): NetworkTracerApi {
  return {
    ...configApi,
    start: commands.start,
    stop: commands.stop,
    forceStop: commands.forceStop,
    isEnabled: state.isEnabled,
    getState: state.getState,
    getPendingRequestCount: state.getPendingRequestCount,
  };
}
