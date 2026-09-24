import { matchesPattern } from "./matchesPattern.js";

/**
 * Checks if a target (function or component) should be instrumented based on include/exclude patterns.
 * Generic function used by both Flow (functions) and React (components).
 * Pure function with no side effects.
 *
 * @param targetName - Name of the target (function or component)
 * @param include - Include patterns (glob, regex, or exact strings)
 * @param exclude - Exclude patterns (glob, regex, or exact strings)
 * @param anonymousName - Name used to identify anonymous targets (default: "anonymous")
 * @returns True if target should be instrumented
 *
 * @example
 * shouldInstrumentTarget("Button", ["App", "Button"], undefined)
 * // Returns: true (matches include pattern)
 *
 * @example
 * shouldInstrumentTarget("handleClick", undefined, [/^handle/])
 * // Returns: false (matches exclude pattern)
 *
 * @example
 * shouldInstrumentTarget("anonymous", ["*"], undefined)
 * // Returns: false (anonymous excluded when include patterns exist)
 */
export function shouldInstrumentTarget(
  targetName: string,
  include?: Array<string | RegExp>,
  exclude?: Array<string | RegExp>,
  anonymousName: string = "anonymous"
): boolean {
  // Anonymous targets can't be filtered by name
  if (targetName === anonymousName) {
    // If include patterns specified, exclude anonymous by default
    if (include && include.length > 0) {
      return false;
    }
    return true; // No include filters, instrument by default
  }

  // Check exclude patterns first (they take precedence)
  if (exclude && exclude.length > 0) {
    for (const pattern of exclude) {
      if (matchesPattern(targetName, pattern)) {
        return false; // Excluded
      }
    }
  }

  // If include patterns specified, target must match at least one
  if (include && include.length > 0) {
    for (const pattern of include) {
      if (matchesPattern(targetName, pattern)) {
        return true; // Included
      }
    }
    return false; // Didn't match any include pattern
  }

  // No include patterns specified, instrument by default (unless excluded above)
  return true;
}
