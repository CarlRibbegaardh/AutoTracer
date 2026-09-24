import { matchesPattern } from "@autotracer/filter-utils";

/**
 * Determines whether a field name matches a case-insensitive redaction pattern.
 *
 * @param name - Field name to evaluate.
 * @param patterns - Exact or glob strings that identify sensitive fields.
 * @returns `true` when any pattern matches the field name.
 */
export function isRedactionNameMatched(
  name: string,
  patterns: readonly string[],
): boolean {
  const normalizedName = name.toLowerCase();
  return patterns.some((pattern) => {
    return matchesPattern(normalizedName, pattern.toLowerCase());
  });
}
