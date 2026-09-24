import type { StateChangesBuilder } from "../StateChangesBuilder.js";
import { buildLabelsOnlyMountStateChanges } from "./buildLabelsOnlyMountStateChanges.js";
import { buildLabelsOnlyUpdateStateChanges } from "./buildLabelsOnlyUpdateStateChanges.js";
import { withPrevLabelPersistence } from "../../withPrevLabelPersistence.js";

/**
 * Creates a labels-only state changes builder.
 * Pure factory function - returns an object with two methods.
 *
 * The labels-only strategy:
 * - Uses only explicitly labeled state from the registry
 * - Ignores fiber hooks entirely
 * - No heuristics, no .internal suffixes, no unknown labels
 * - Cleaner, faster, and fixes stable reference bugs
 *
 * @returns StateChangesBuilder implementation for labels-only strategy
 */
export function createLabelsOnlyBuilder(): StateChangesBuilder {
  return {
    buildTrackedMount: (trackingGUID) => {
      return withPrevLabelPersistence(
        buildLabelsOnlyMountStateChanges(trackingGUID),
        trackingGUID,
      );
    },

    buildTrackedUpdate: (trackingGUID) => {
      return withPrevLabelPersistence(
        buildLabelsOnlyUpdateStateChanges(trackingGUID),
        trackingGUID,
      );
    },
  };
}
