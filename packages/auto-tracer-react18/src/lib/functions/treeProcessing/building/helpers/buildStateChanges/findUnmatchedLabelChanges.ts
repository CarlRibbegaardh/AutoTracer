import {
  getLabelsForGuid,
  getPrevLabelsForGuid,
} from "../../../../hookLabels.js";
import { detectIdenticalValueChange } from "./detectIdenticalValueChange.js";
import { internalLogger } from "@logger/internalLogger.js";
import type { StateChangeEntry } from "../buildStateChanges.js";

/**
 * Builds a map of previous label values for quick lookup.
 *
 * Pure function - no side effects.
 *
 * @param prevLabels - Array of previous label entries
 * @returns Map of label name to value
 */
function buildPrevValueMap(
  prevLabels: Array<{ label: string; value: unknown }>
): Map<string, unknown> {
  return new Map(
    prevLabels.map((e) => {
      return [e.label, e.value];
    })
  );
}

/**
 * Checks if a label entry represents an actual change.
 *
 * Pure function - no side effects.
 *
 * @param label - Label name
 * @param value - Current value
 * @param prevValueMap - Map of previous values
 * @returns StateChangeEntry if changed, null if unchanged or new
 */
function createLabelChangeEntry(
  label: string,
  value: unknown,
  prevValueMap: Map<string, unknown>
): StateChangeEntry | null {
  const prevValue = prevValueMap.get(label);
  if (prevValue === undefined) return null;
  if (prevValue === value) return null;
  const isIdenticalValueChange = detectIdenticalValueChange(prevValue, value);
  return {
    name: label,
    value,
    prevValue,
    hook: null,
    isIdenticalValueChange,
  };
}

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
  internalLogger.debug(`buildStateChanges: Getting current and prev labels`);

  const currentLabels = getLabelsForGuid(trackingGUID);
  const prevLabels = getPrevLabelsForGuid(trackingGUID);

  internalLogger.debug(`buildStateChanges: Building prevValueMap`);

  const prevValueMap = buildPrevValueMap(prevLabels);

  internalLogger.debug(`buildStateChanges: Filtering and mapping changes`);

  const changes = currentLabels
    .filter(({ label }) => {
      return !matchedLabels.has(label);
    })
    .map(({ label, value }) => {
      return createLabelChangeEntry(label, value, prevValueMap);
    })
    .filter((c) => {
      return c !== null;
    });

  return changes;
}

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
