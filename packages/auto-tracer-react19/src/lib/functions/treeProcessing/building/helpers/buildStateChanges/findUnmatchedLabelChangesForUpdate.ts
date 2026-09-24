import { getLabelsForGuid, getPrevLabelsForGuid } from "../../../../hookLabels.js";
import { detectIdenticalValueChange } from "./detectIdenticalValueChange.js";
import { internalLogger } from "@logger/internalLogger.js";
import type { StateChangeEntry } from "../buildStateChanges.js";

/**
 * Finds unmatched labeled state changes for a tracked component during updates.
 * Returns only labels that changed and were not matched to fiber state.
 *
 * Pure function (reads from registry) - no mutations.
 *
 * @param trackingGUID - Tracking GUID for the component
 * @param matchedLabels - Set of label names already matched to fiber state
 * @returns Array of state change entries for unmatched labels
 */
export function findUnmatchedLabelChangesForUpdate(
  trackingGUID: string,
  matchedLabels: Set<string>
): StateChangeEntry[] {
  internalLogger.debug(`buildStateChanges: Getting current labels`);

  const currentLabels = getLabelsForGuid(trackingGUID);
  const prevLabels = getPrevLabelsForGuid(trackingGUID);

  internalLogger.debug(`buildStateChanges: Building prev value map`);

  const prevValueMap = new Map<string, unknown>();
  for (const prev of prevLabels) {
    prevValueMap.set(prev.label, prev.value);
  }

  internalLogger.debug(`buildStateChanges: Filtering and mapping changes`);

  const changes = currentLabels
    .filter(({ label }) => {
      return !matchedLabels.has(label);
    })
    .map(({ label, value, prevValue: labelPrevValue }) => {
      // Use prevValue from label entry if available, otherwise look it up from previous labels
      const prevValue = labelPrevValue !== undefined ? labelPrevValue : prevValueMap.get(label);

      if (prevValue === undefined) return null;
      if (prevValue === value) return null;
      const isIdenticalValueChange = detectIdenticalValueChange(
        prevValue,
        value
      );
      return {
        name: label,
        value,
        prevValue,
        hook: null,
        isIdenticalValueChange,
      };
    })
    .filter((c) => {
      return c !== null;
    });

  return changes;
}
