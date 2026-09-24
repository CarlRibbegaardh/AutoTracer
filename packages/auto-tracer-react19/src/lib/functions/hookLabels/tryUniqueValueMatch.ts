import type { LabelEntry } from "./LabelEntry.js";
import type { StructuralMatchResult } from "./tryStructuralMatch.js";
import { matchUniqueValue } from "./matchUniqueValue.js";
import { tryStructuralMatch } from "./tryStructuralMatch.js";
import { withCache } from "../functionCache/withCache.js";

const cachedMatchUniqueValue = withCache(
  "matchUniqueValue",
  "tryUniqueValueMatch",
  matchUniqueValue
);

/**
 * Attempts to match a unique value (single occurrence in fiber) to a label.
 * Tries direct value match first, then structural match fallback.
 *
 * Pure function (except caching and registry reads) - no mutations.
 *
 * @param labels - All stored labels for the component
 * @param anchorIndex - Index of the anchor in fiber
 * @param anchorValue - Current value of the anchor
 * @param allAnchors - All stateful hooks in the fiber
 * @returns Structural match result with label or failure
 */
export function tryUniqueValueMatch(
  labels: LabelEntry[],
  anchorIndex: number,
  anchorValue: unknown,
  allAnchors: Array<{ index: number; value: unknown }>
): StructuralMatchResult {
  // Try direct value match
  const directMatch = cachedMatchUniqueValue(labels, anchorValue);
  if (directMatch?.label) {
    return {
      success: true,
      label: directMatch.label,
      updatedNormalizedValue: null,
    };
  }

  // Fallback to structural matching
  return tryStructuralMatch(labels, anchorIndex, anchorValue, allAnchors);
}
