import { getLabelsForGuid } from "../../../../hookLabels.js";
import { internalLogger } from "@logger/internalLogger.js";
import type { StateChangeEntry } from "../buildStateChanges.js";

/**
 * Finds unmatched labeled state for a tracked component during mount.
 * Returns all labels that were not matched to fiber state.
 *
 * Pure function (reads from registry) - no mutations.
 *
 * @param trackingGUID - Tracking GUID for the component
 * @param matchedLabels - Set of label names already matched to fiber state
 * @returns Array of state change entries for unmatched labels
 */
export function findUnmatchedLabelChangesForMount(
  trackingGUID: string,
  matchedLabels: Set<string>
): StateChangeEntry[] {
  internalLogger.debug(
    `buildStateChanges: Getting unmatched labels for GUID (mount)`
  );

  const currentLabels = getLabelsForGuid(trackingGUID);

  return currentLabels
    .filter(({ label }) => {
      return !matchedLabels.has(label);
    })
    .map(({ label, value }) => {
      return {
        name: label,
        value,
        prevValue: undefined,
        hook: null,
        isIdenticalValueChange: false,
      };
    });
}
