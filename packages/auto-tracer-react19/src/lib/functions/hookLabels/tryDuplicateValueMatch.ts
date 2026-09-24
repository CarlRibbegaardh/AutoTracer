import type { LabelEntry } from "./LabelEntry.js";
import type { StructuralMatchResult } from "./tryStructuralMatch.js";
import { stringify } from "../stringify.js";
import { matchByOrdinal } from "./matchByOrdinal.js";
import { matchByConstraints } from "./matchByConstraints.js";
import { tryStructuralMatch } from "./tryStructuralMatch.js";

/**
 * Attempts to match a duplicate value (multiple occurrences in fiber) to a label.
 * Uses ordinal matching, constraint-based matching, or structural fallback.
 *
 * Pure function (except registry reads) - no mutations.
 *
 * @param labels - All stored labels for the component
 * @param anchorIndex - Index of the anchor in fiber
 * @param anchorValue - Current value of the anchor
 * @param anchorComparable - Comparable string of anchor value
 * @param valueGroup - Anchors with matching comparable value
 * @param allAnchors - All stateful hooks in the fiber
 * @returns Structural match result with label(s) or failure
 */
export function tryDuplicateValueMatch(
  labels: LabelEntry[],
  anchorIndex: number,
  anchorValue: unknown,
  anchorComparable: string,
  valueGroup: Array<{ index: number; value: unknown }>,
  allAnchors: Array<{ index: number; value: unknown }>
): StructuralMatchResult {
  // Find labels with matching value
  const labelsWithValue = labels.filter((l) => {
    const labelComparable = stringify(l.normalizedValue);
    return labelComparable === anchorComparable;
  });

  // Try ordinal match (all occurrences labeled)
  const ordinalMatch = matchByOrdinal(labelsWithValue, valueGroup, anchorIndex);
  if (ordinalMatch) {
    return {
      success: true,
      label: ordinalMatch.label,
      updatedNormalizedValue: null,
    };
  }

  // Try constraint-based match (partial coverage)
  const possibleLabels = matchByConstraints(
    labelsWithValue,
    valueGroup,
    anchorIndex
  );

  // If no labels match, try structural matching
  if (possibleLabels.length === 0) {
    return tryStructuralMatch(labels, anchorIndex, anchorValue, allAnchors);
  }

  // Return union of possible labels
  const labelNames = [...possibleLabels]
    .sort((a, b) => {
      return a.index - b.index;
    })
    .map((l) => {
      return l.label;
    });

  return {
    success: true,
    label: [...labelNames, "unknown"].join(" | "),
    updatedNormalizedValue: null,
  };
}
