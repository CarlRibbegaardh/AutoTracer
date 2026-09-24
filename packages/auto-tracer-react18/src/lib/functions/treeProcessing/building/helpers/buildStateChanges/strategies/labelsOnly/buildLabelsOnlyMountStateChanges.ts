import type { StateChangeEntry } from "../../../buildStateChanges.js";
import { getLabelsForGuid } from "../../../../../../hookLabels/registry/getLabelsForGuid.js";

/**
 * Builds state changes for tracked component mount using labels only.
 * Pure function - reads from registry, no side effects.
 *
 * All labeled state is reported as initial state with undefined prevValue.
 *
 * @param trackingGUID - The tracking GUID of the component
 * @returns Array of state change entries for all labeled state
 */
export function buildLabelsOnlyMountStateChanges(
  trackingGUID: string
): StateChangeEntry[] {
  const currentLabels = getLabelsForGuid(trackingGUID);

  return currentLabels.map(({ label, value }) => {return {
    name: label,
    value,
    prevValue: undefined,
    hook: null, // No fiber reference needed
    isIdenticalValueChange: false,
  }});
}
