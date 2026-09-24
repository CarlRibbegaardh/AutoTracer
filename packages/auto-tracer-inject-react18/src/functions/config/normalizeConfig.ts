import type { TransformConfig } from "../../interfaces/TransformConfig.js";
import { DEFAULT_CONFIG } from "./DEFAULT_CONFIG.js";

/**
 * normalizeConfig
 *
 * Returns a fully-populated configuration by merging user-provided partial values
 * with the DEFAULT_CONFIG. This function is the canonical way to obtain a
 * Required<TransformConfig> for downstream logic.
 *
 * Deep merges nested objects (include/exclude) to ensure all fields are present.
 */
export function normalizeConfig(
  config: Partial<TransformConfig> = {}
): Required<TransformConfig> {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    include: {
      ...DEFAULT_CONFIG.include,
      ...(config.include ?? {}),
    },
    exclude: {
      ...DEFAULT_CONFIG.exclude,
      ...(config.exclude ?? {}),
    },
  };
}
