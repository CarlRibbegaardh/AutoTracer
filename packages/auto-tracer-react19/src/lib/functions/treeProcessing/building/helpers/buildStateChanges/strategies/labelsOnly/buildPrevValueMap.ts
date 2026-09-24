import type { LabelEntry } from "../../../../../../hookLabels/LabelEntry.js";

/**
 * Builds a map of previous label values for quick lookup during comparison.
 * Pure function - no side effects.
 *
 * @param prevLabels - Array of label entries from the previous render
 * @returns Immutable map from label name to previous value
 */
export function buildPrevValueMap(
  prevLabels: readonly LabelEntry[]
): ReadonlyMap<string, unknown> {
  return new Map(prevLabels.map(({ label, value }) => {return [label, value]}));
}
