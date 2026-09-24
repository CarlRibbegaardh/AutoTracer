import { matchesPattern } from "@autotracer/filter-utils";

/**
 * Checks if a component name matches a trigger pattern.
 * Supports glob patterns (e.g., "handle*"), regex patterns, and exact strings.
 *
 * Pure function with no side effects.
 *
 * @param componentName - Component name to test
 * @param triggerPattern - Trigger pattern (glob, regex, or exact string), or null
 * @returns True if component name matches trigger pattern
 */
export function matchesTrigger(
  componentName: string,
  triggerPattern: string | RegExp | null
): boolean {
  if (triggerPattern === null || triggerPattern === undefined) {
    return false;
  }

  // Handle RegExp patterns directly
  if (triggerPattern instanceof RegExp) {
    return matchesPattern(componentName, triggerPattern);
  }

  // Handle string patterns
  const normalized = triggerPattern.trim();
  if (normalized.length === 0) {
    return false;
  }

  return matchesPattern(componentName, normalized);
}
