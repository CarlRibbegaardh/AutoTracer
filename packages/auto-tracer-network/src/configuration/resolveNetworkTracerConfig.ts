import type { NetworkTracerConfig } from "./NetworkTracerConfig.js";
import type { NetworkTracerConfigOverrides } from "./NetworkTracerConfigOverrides.js";
import { defaultNetworkTracerConfig } from "./defaultNetworkTracerConfig.js";

/**
 * Resolves NetworkTracer configuration according to approved precedence.
 *
 * @param initializerDefaults - Project defaults supplied at initialization.
 * @param persistedConfig - Validated developer values loaded from storage.
 * @returns A new configuration with persisted values taking highest precedence.
 */
export function resolveNetworkTracerConfig(
  initializerDefaults: NetworkTracerConfigOverrides,
  persistedConfig: NetworkTracerConfigOverrides,
): NetworkTracerConfig {
  const resolvedConfig = {
    ...defaultNetworkTracerConfig,
    ...initializerDefaults,
    ...persistedConfig,
  };

  return {
    ...resolvedConfig,
    redactionPatterns: [...resolvedConfig.redactionPatterns],
    includePatterns: [...resolvedConfig.includePatterns],
    excludePatterns: [...resolvedConfig.excludePatterns],
  };
}
