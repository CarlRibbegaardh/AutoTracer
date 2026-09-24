import type { NetworkTracerConfigWriteStorage } from "./NetworkTracerConfigWriteStorage.js";
import type { PersistedNetworkTracerConfig } from "./PersistedNetworkTracerConfig.js";

/**
 * Writes one version 1 NetworkTracer configuration document.
 *
 * @param storage - Storage receiving the serialized configuration.
 * @param config - Validated configuration values to persist.
 */
export function writePersistedNetworkTracerConfig(
  storage: NetworkTracerConfigWriteStorage,
  config: PersistedNetworkTracerConfig,
): void {
  storage.setItem(
    "__autotracer.network.config.v1",
    JSON.stringify({ version: 1, config }),
  );
}
