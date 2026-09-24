import { minimatch } from "minimatch";

/**
 * Checks if a string matches a pattern (glob, regex, or exact string).
 * Pure function with no side effects.
 *
 * @param value - String to test
 * @param pattern - Pattern to match (glob, regex, or exact string)
 * @returns True if value matches pattern
 *
 * @example
 * matchesPattern("Button", "Button")           // true - exact match
 * matchesPattern("Button", "Button*")          // true - glob
 * matchesPattern("handleClick", /^handle/)     // true - regex
 */
export function matchesPattern(value: string, pattern: string | RegExp): boolean {
  if (pattern instanceof RegExp) {
    return pattern.test(value);
  }

  // Check if pattern contains glob characters
  if (pattern.includes("*") || pattern.includes("?") || pattern.includes("[")) {
    return minimatch(value, pattern);
  }

  // Exact string match
  return value === pattern;
}
