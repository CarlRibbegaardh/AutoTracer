import { matchesPattern } from "@autotracer/filter-utils";

/**
 * Determines whether configured URL patterns include a network request.
 *
 * @param normalizedRequestedUrl - Absolute requested URL to evaluate.
 * @param includePatterns - Exact or glob strings that admit requests.
 * @param excludePatterns - Exact or glob strings that hide requests.
 * @returns `true` when the request is included and not excluded.
 */
export function isNetworkRequestIncluded(
  normalizedRequestedUrl: string,
  includePatterns: readonly string[],
  excludePatterns: readonly string[]
): boolean {
  if (
    excludePatterns.some((pattern) =>
      {return matchesPattern(normalizedRequestedUrl, pattern)}
    )
  ) {
    return false;
  }

  return (
    includePatterns.length === 0 ||
    includePatterns.some((pattern) =>
      {return matchesPattern(normalizedRequestedUrl, pattern)}
    )
  );
}
