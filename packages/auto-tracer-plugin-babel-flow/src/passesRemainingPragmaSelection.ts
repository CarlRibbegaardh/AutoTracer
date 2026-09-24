import type { PragmaResult } from "@autotracer/filter-utils";
import type { NormalizedBabelPluginFlowConfig } from "./types/index.js";

/**
 * Returns `true` when a function should be instrumented based on pragma state and mode,
 * after eligibility (include/exclude) gates have already passed.
 *
 * @remarks
 * Precedence (applied in order):
 * 1. `@trace-disable` (via `hasDisable`) → always skip.
 * 2. `opt-in` mode with `@trace` (via `hasTrace`) → instrument.
 * 3. `opt-out` mode → instrument (default on, unless disabled above).
 * 4. `opt-in` mode without `@trace` → skip.
 *
 * @param pragmas - The effective pragma result for this function.
 * @param config - The normalized plugin configuration.
 * @returns `true` when the function should be instrumented.
 */
export const passesRemainingPragmaSelection = (
  pragmas: PragmaResult,
  config: NormalizedBabelPluginFlowConfig,
): boolean => {
  if (pragmas.hasDisable) return false;
  if (pragmas.hasTrace) return true;
  return config.mode === "opt-out";
};
