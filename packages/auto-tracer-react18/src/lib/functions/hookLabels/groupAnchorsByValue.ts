import { toComparableString } from "./toComparableString.js";
import { isReactInternalObject } from "./isReactInternalObject.js";

/**
 * Groups fiber anchors that have the same comparable value as the target anchor.
 * Filters out React internals and values that fail comparison.
 *
 * Pure function (except logging) - no mutations.
 *
 * @param allAnchors - All stateful hooks in the fiber
 * @param targetComparable - Comparable string of the target anchor value
 * @returns Array of anchors with matching comparable values
 */
export function groupAnchorsByValue(
  allAnchors: Array<{ index: number; value: unknown }>,
  targetComparable: string
): Array<{ index: number; value: unknown }> {
  return allAnchors.filter((anchor) => {
    // Skip React internals
    if (isReactInternalObject(anchor.value)) {
      return false;
    }

    try {
      const comparable = toComparableString(anchor.value);
      return comparable === targetComparable;
    } catch {
      return false;
    }
  });
}
