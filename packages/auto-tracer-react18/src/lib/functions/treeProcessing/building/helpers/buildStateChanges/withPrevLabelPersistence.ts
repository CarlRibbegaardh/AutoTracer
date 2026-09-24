import { savePrevLabelsForGuid } from "../../../../hookLabels.js";
import { internalLogger } from "@logger/internalLogger.js";
import type { StateChangeEntry } from "../buildStateChanges.js";

/**
 * Wraps update state changes computation with previous label persistence side effect.
 * Preserves the side-effect timing: computation happens first, then persistence.
 *
 * Impure function - contains deliberate side effect (savePrevLabelsForGuid).
 * Separates command (write) from query (read) by wrapping pure computation.
 *
 * @param changes - State changes computed by pure update function
 * @param trackingGUID - Tracking GUID for label persistence
 * @returns The same state changes array (pass-through)
 */
export function withPrevLabelPersistence(
  changes: StateChangeEntry[],
  trackingGUID: string
): StateChangeEntry[] {
  internalLogger.debug(`buildStateChanges: Saving prev labels`);

  // preserve side-effect timing post computation
  savePrevLabelsForGuid(trackingGUID);

  return changes;
}
