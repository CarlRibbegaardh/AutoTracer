import { matchesPattern } from "@autotracer/filter-utils";

/**
 * Checks if a function name matches a trigger pattern.
 * Supports glob patterns (e.g., "handle*"), regex patterns, and exact strings.
 *
 * Pure function with no side effects.
 *
 * @param functionName - Function name to test
 * @param triggerPattern - Trigger pattern (glob, regex, or exact string), or null
 * @returns True if function name matches trigger pattern
 */
export function matchesTrigger(
  functionName: string,
  triggerPattern: string | RegExp | null
): boolean {
  if (triggerPattern === null || triggerPattern === undefined) {
    return false;
  }

  // Handle RegExp patterns directly
  if (triggerPattern instanceof RegExp) {
    return matchesPattern(functionName, triggerPattern);
  }

  // Handle string patterns
  const normalized = triggerPattern.trim();
  if (normalized.length === 0) {
    return false;
  }

  return matchesPattern(functionName, normalized);
}
