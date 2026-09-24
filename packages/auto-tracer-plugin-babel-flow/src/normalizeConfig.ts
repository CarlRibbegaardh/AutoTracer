import type {
  BabelPluginFlowConfig,
  NormalizedBabelPluginFlowConfig,
} from "./types/index.js";
import { DEFAULT_CONFIG } from "./types/index.js";

/**
 * Normalizes partial config into full config with defaults.
 *
 * Merge strategy: object-key merge for `include` and `exclude`.
 * A user-supplied key replaces the default value for that key; an omitted key
 * retains the default. Arrays are never concatenated.
 *
 * Pure function with no side effects.
 *
 * @param config - Partial configuration
 * @returns Normalized configuration
 */
export function normalizeConfig(
  config?: Partial<BabelPluginFlowConfig>
): NormalizedBabelPluginFlowConfig {
  const normalized: NormalizedBabelPluginFlowConfig = {
    logExceptions: config?.logExceptions ?? true,
    exceptionLogLevel: config?.exceptionLogLevel ?? "debug",
    tracerName: config?.tracerName ?? "__flowTracer",
    include: { ...DEFAULT_CONFIG.include, ...(config?.include ?? {}) },
    exclude: { ...DEFAULT_CONFIG.exclude, ...(config?.exclude ?? {}) },
    mode: config?.mode ?? "opt-out",
  };

  const outputMode = config?.outputMode;
  const prefix = config?.prefix;

  const withOutputMode =
    outputMode === "devtools" || outputMode === "copy-paste"
      ? { ...normalized, outputMode }
      : normalized;

  return prefix !== undefined ? { ...withOutputMode, prefix } : withOutputMode;
}
