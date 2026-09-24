/**
 * Validation utilities for reactTracer options
 */

import type { ReactTracerOptions } from "../interfaces/ReactTracerOptions.js";
import type { OutputMode } from "../autoTracer/OutputMode.js";
import { logWarn } from "./log.js";

/**
 * Validates and clamps maxFiberDepth to safe bounds
 * @param depth - The depth value to validate
 * @returns Clamped depth value between 20 and 1000
 */
export function validateMaxFiberDepth(depth: number | undefined): number {
  // Default to 500 if not provided
  if (depth === undefined || depth === null) {
    return 500;
  }

  // Ensure it's a valid number
  if (typeof depth !== "number" || isNaN(depth)) {
    logWarn("ReactTracer: Invalid maxFiberDepth, using default (500)");
    return 500;
  }

  // Clamp between 20 and 1000
  if (depth < 20) {
    logWarn("ReactTracer: maxFiberDepth too low, using minimum (20)");
    return 20;
  }

  if (depth > 1000) {
    logWarn("ReactTracer: maxFiberDepth too high, using maximum (1000)");
    return 1000;
  }

  return Math.floor(depth); // Ensure integer
}

/**
 * Validates an entire ReactTracerOptions object
 * @param options - Options to validate
 * @returns Validated options with safe values
 */
export function validateReactTracerOptions(
  options: ReactTracerOptions
): ReactTracerOptions {
  /**
   * Validates the outputMode option.
   *
   * @param mode - Candidate output mode
   * @returns Valid output mode or undefined
   */
  function validateOutputMode(mode: unknown): OutputMode | undefined {
    if (mode === undefined) return undefined;

    if (mode === "devtools" || mode === "copy-paste") {
      return mode;
    }

    logWarn("ReactTracer: Invalid outputMode, using default ('devtools')");
    return undefined;
  }

  const validatedOutputMode = validateOutputMode(options.outputMode);
  const { outputMode: _ignoredOutputMode, ...optionsWithoutOutputMode } = options;

  return {
    ...optionsWithoutOutputMode,
    ...(validatedOutputMode === undefined
      ? {}
      : { outputMode: validatedOutputMode }),
    maxFiberDepth: validateMaxFiberDepth(options.maxFiberDepth),
  };
}
