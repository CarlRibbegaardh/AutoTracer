import type { TransformConfig } from "../../interfaces/TransformConfig.js";
import { shouldInstrumentTarget } from "@autotracer/filter-utils";

/**
 * shouldInstrumentComponent
 *
 * Determines whether a component should be instrumented based on the eligibility-first
 * contract. Target eligibility gates (include/exclude component filters) are absolute
 * and evaluated before any pragma signals; `@trace` cannot bypass them.
 *
 * Precedence (highest to lowest):
 * 1. Target eligibility: include miss or explicit exclude → always skip (`@trace` has no effect)
 * 2. `@trace-disable` pragma within the eligible set → skip
 * 3. `@trace` pragma within the eligible set → instrument
 * 4. Mode fallback: `opt-out` instruments by default; `opt-in` skips unless `@trace` was present
 *
 * @param componentName - Name of the component to check
 * @param pragmas - Pragma flags from component comments
 * @param config - Transform configuration
 * @returns True if component should be instrumented
 */
export function shouldInstrumentComponent(
  componentName: string,
  pragmas: { hasTrace: boolean; hasDisable: boolean },
  config: Required<TransformConfig>
): boolean {
  // 1. Target eligibility gates are absolute — @trace cannot bypass them.
  //    A target that misses include.components or matches exclude.components is ineligible.
  const hasIncludeFilter =
    config.include.components != null && config.include.components.length > 0;
  const hasExcludeFilter =
    config.exclude.components != null && config.exclude.components.length > 0;

  if (hasIncludeFilter || hasExcludeFilter) {
    const eligible = shouldInstrumentTarget(
      componentName,
      config.include.components,
      config.exclude.components,
      "anonymous"
    );
    if (!eligible) return false;
  }

  // 2. Within the eligible set: @trace-disable is the highest-precedence skip signal.
  if (pragmas.hasDisable) {
    return false;
  }

  // 3. Within the eligible set: @trace enables instrumentation.
  if (pragmas.hasTrace) {
    return true;
  }

  // 4. Mode fallback — opt-in requires an explicit @trace; opt-out instruments by default.
  return config.mode !== "opt-in";
}
