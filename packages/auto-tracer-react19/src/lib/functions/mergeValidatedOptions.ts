import type { ReactTracerOptions } from "../interfaces/ReactTracerOptions.js";
import type { ReactTracerInternalOptions } from "../types/ReactTracerInternalOptions.js";
import { validateReactTracerOptions } from "./validateOptions.js";
import { deepMergeOptions } from "./deepMerge.js";

/**
 * Validates and merges partial options with current options.
 *
 * Pure function - performs validation and deep merge without side effects.
 * Validation ensures type safety and option constraints are met before merging.
 *
 * @param currentOptions - Current tracer options to merge into
 * @param partialOptions - Partial options to validate and merge
 * @returns Merged and validated options object
 */
export function mergeValidatedOptions(
  currentOptions: ReactTracerInternalOptions,
  partialOptions: Partial<ReactTracerOptions>,
): ReactTracerInternalOptions {
  const validatedOptions = validateReactTracerOptions(partialOptions);
  return deepMergeOptions(currentOptions, validatedOptions);
}
