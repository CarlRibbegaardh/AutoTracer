import type { NetworkTracerApi } from "../api/NetworkTracerApi.js";
import type { NetworkTracerConfigOverrides } from "../configuration/NetworkTracerConfigOverrides.js";
import { resolveNetworkTracerConfig } from "../configuration/resolveNetworkTracerConfig.js";
import { getConflictingNetworkTracerDefaultKeys } from "./getConflictingNetworkTracerDefaultKeys.js";

/**
 * Installs or reuses the NetworkTracer runtime owned by one browser realm.
 *
 * @param dependencies - Realm, initializer defaults, runtime factory, and diagnostic sink.
 * @returns The realm-owned NetworkTracer API.
 */
export function installNetworkTracerRuntime(
  dependencies: Readonly<{
    realm: {
      autoTracer?: { networkTracer?: NetworkTracerApi };
      __autoTracerNetworkRuntime?: Readonly<{
        api: NetworkTracerApi;
        initializerDefaults: NetworkTracerConfigOverrides;
      }>;
    };
    initializerDefaults: NetworkTracerConfigOverrides;
    createRuntime: (
      initializerDefaults: NetworkTracerConfigOverrides,
    ) => NetworkTracerApi;
    log: (message: string) => void;
  }>,
): NetworkTracerApi {
  const existing = dependencies.realm.__autoTracerNetworkRuntime;
  if (existing !== undefined) {
    const conflicts = getConflictingNetworkTracerDefaultKeys(
      existing.initializerDefaults,
      dependencies.initializerDefaults,
    );
    if (conflicts.length > 0) {
      dependencies.log(
        `NetworkTracer ignored conflicting initializer defaults: ${conflicts.join(", ")}.`,
      );
    }
    return existing.api;
  }

  const autoTracer = dependencies.realm.autoTracer;
  if (autoTracer === undefined) {
    throw new Error("NetworkTracer requires shared AutoTracer controls.");
  }

  const api = dependencies.createRuntime(dependencies.initializerDefaults);
  autoTracer.networkTracer = api;
  dependencies.realm.__autoTracerNetworkRuntime = {
    api,
    initializerDefaults: resolveNetworkTracerConfig(
      dependencies.initializerDefaults,
      {},
    ),
  };
  return api;
}
