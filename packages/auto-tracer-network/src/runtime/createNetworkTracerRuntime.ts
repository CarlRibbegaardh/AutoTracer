import { buildNetworkTracerApi } from "../api/buildNetworkTracerApi.js";
import { buildNetworkTracerConfigApi } from "../api/buildNetworkTracerConfigApi.js";
import { createNetworkTracingCommands } from "../api/createNetworkTracingCommands.js";
import type { NetworkTracerApi } from "../api/NetworkTracerApi.js";
import { createNetworkTracerConfigStore } from "../configuration/createNetworkTracerConfigStore.js";
import type { NetworkTracerConfigOverrides } from "../configuration/NetworkTracerConfigOverrides.js";
import type { NetworkTracerConfigReadWriteStorage } from "../configuration/NetworkTracerConfigReadWriteStorage.js";
import { createIncludedRequestCountStore } from "../identity/createIncludedRequestCountStore.js";
import { createRequestIdStore } from "../identity/createRequestIdStore.js";
import type { createNetworkEventArguments } from "../output/createNetworkEventArguments.js";
import { createNetworkTracerStateStore } from "../state/createNetworkTracerStateStore.js";
import { createNetworkTracingDrainStore } from "../state/createNetworkTracingDrainStore.js";
import { createFetchWrapperHandler } from "../transport/createFetchWrapperHandler.js";
import { createXhrInstanceStoreRegistry } from "../transport/createXhrInstanceStoreRegistry.js";
import { createXhrWrapperHandlers } from "../transport/createXhrWrapperHandlers.js";
import { installFetchWrapper } from "../transport/installFetchWrapper.js";
import { installXhrWrappers } from "../transport/installXhrWrappers.js";
import { createNetworkEventEmitter } from "./createNetworkEventEmitter.js";
import { createNetworkTransportRuntime } from "./createNetworkTransportRuntime.js";

/**
 * Creates one NetworkTracer runtime and installs its available browser transports.
 *
 * @param dependencies - Browser capabilities, project defaults, persistence, timing, and output dependencies.
 * @returns The live public NetworkTracer control surface.
 */
export function createNetworkTracerRuntime(
  dependencies: Readonly<{
    target: {
      fetch?: typeof fetch;
      XMLHttpRequest?: typeof XMLHttpRequest;
    };
    storage: NetworkTracerConfigReadWriteStorage;
    initializerDefaults: NetworkTracerConfigOverrides;
    baseUrl: string;
    getMonotonicMarker: () => number;
    getOutputSettings: () => Parameters<typeof createNetworkEventArguments>[1];
    log: (...arguments_: readonly unknown[]) => void;
  }>,
): NetworkTracerApi {
  const configStore = createNetworkTracerConfigStore(
    dependencies.storage,
    dependencies.initializerDefaults,
  );
  const stateStore = createNetworkTracerStateStore(false);
  const requestIds = createRequestIdStore();
  const admittedRequests = createIncludedRequestCountStore();
  const drainStore = createNetworkTracingDrainStore();
  const emit = createNetworkEventEmitter(
    dependencies.getOutputSettings,
    dependencies.log,
  );
  const commands = createNetworkTracingCommands({
    stateStore,
    drainStore,
    requestIds,
    admittedRequests,
    getWaitForPendingRequests: () =>
      {return configStore.getConfig().waitForPendingRequestsOnStop},
    emit,
  });
  const transportRuntime = createNetworkTransportRuntime({
    stateStore,
    configStore,
    requestIds,
    admittedRequests,
    commands,
    baseUrl: dependencies.baseUrl,
    getMonotonicMarker: dependencies.getMonotonicMarker,
    emit,
  });
  const fetchInstalled = installFetchWrapper(
    dependencies.target,
    createFetchWrapperHandler(transportRuntime),
  );
  const xhrInstalled = installXhrWrappers(
    dependencies.target.XMLHttpRequest,
    createXhrWrapperHandlers(
      createXhrInstanceStoreRegistry(),
      transportRuntime,
    ),
  );
  const hasInstalledTransport = fetchInstalled || xhrInstalled;

  if (hasInstalledTransport && configStore.getConfig().enabledOnLoad) {
    stateStore.enterRunning();
  }

  /** Starts tracing only when the runtime owns an installed transport. */
  function start(): void {
    if (hasInstalledTransport) commands.start();
  }

  /** Stops tracing only when the runtime owns an installed transport. */
  function stop(): void {
    if (hasInstalledTransport) commands.stop();
  }

  /** Force-stops tracing only when the runtime owns an installed transport. */
  function forceStop(): void {
    if (hasInstalledTransport) commands.forceStop();
  }

  return buildNetworkTracerApi(
    { start, stop, forceStop },
    stateStore,
    buildNetworkTracerConfigApi(configStore),
  );
}