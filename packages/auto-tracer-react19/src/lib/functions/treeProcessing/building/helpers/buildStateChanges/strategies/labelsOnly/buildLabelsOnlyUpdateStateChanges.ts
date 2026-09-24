import type { StateChangeEntry } from "../../../buildStateChanges.js";
import { getLabelsForGuid } from "../../../../../../hookLabels/registry/getLabelsForGuid.js";
import { getPrevLabelsForGuid } from "../../../../../../hookLabels/registry/getPrevLabelsForGuid.js";
import { buildPrevValueMap } from "./buildPrevValueMap.js";
import { createLabelChangeEntry } from "./createLabelChangeEntry.js";

/**
 * Builds state changes for tracked component update using labels only.
 * Pure function - reads from registry, no side effects.
 *
 * Compares current labels against previous labels.
 * Only reports labels that exist in both renders and have changed values.
 *
 * @param trackingGUID - The tracking GUID of the component
 * @returns Array of state change entries for changed state
 */
export function buildLabelsOnlyUpdateStateChanges(
  trackingGUID: string
): StateChangeEntry[] {
  const currentLabels = getLabelsForGuid(trackingGUID);
  const prevLabels = getPrevLabelsForGuid(trackingGUID);

  const prevValueMap = buildPrevValueMap(prevLabels);

  return currentLabels
    .map(({ label, value }) => {return createLabelChangeEntry(label, value, prevValueMap)})
    .filter((entry): entry is StateChangeEntry => {return entry !== null});
}
