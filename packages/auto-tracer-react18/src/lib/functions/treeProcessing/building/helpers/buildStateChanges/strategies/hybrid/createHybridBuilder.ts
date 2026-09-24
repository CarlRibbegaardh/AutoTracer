import type { StateChangesBuilder } from "../StateChangesBuilder.js";
import { buildMountStateChanges } from "../../buildMountStateChanges.js";
import { buildUpdateStateChanges } from "../../buildUpdateStateChanges.js";
import { withPrevLabelPersistence } from "../../withPrevLabelPersistence.js";
import type { HookResolutionContext } from "../../HookResolutionContext.js";

/**
 * Creates a hybrid state changes builder.
 * Pure factory function - returns an object with two methods.
 *
 * The hybrid strategy (default, backward compatible):
 * - Uses both fiber hooks AND label registry
 * - Applies heuristics to infer nested hooks
 * - May include .internal suffixes and unknown labels
 * - Existing behavior - completely untouched
 *
 * This is a thin wrapper around the existing buildMountStateChanges and buildUpdateStateChanges.
 *
 * @returns StateChangesBuilder implementation for hybrid strategy
 */
export function createHybridBuilder(): StateChangesBuilder {
  return {
    buildTrackedMount: (trackingGUID, useStateValues, anchors, allAnchors) => {
      const context: HookResolutionContext = {
        anchors,
        allAnchors,
        trackingGUID,
      };
      return buildMountStateChanges(useStateValues, context);
    },

    buildTrackedUpdate: (trackingGUID, useStateValues, anchors, allAnchors) => {
      const context: HookResolutionContext = {
        anchors,
        allAnchors,
        trackingGUID,
      };
      return withPrevLabelPersistence(
        buildUpdateStateChanges(useStateValues, context),
        trackingGUID
      );
    },
  };
}
