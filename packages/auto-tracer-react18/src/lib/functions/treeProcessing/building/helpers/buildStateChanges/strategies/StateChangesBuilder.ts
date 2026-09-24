import type { StateChangeEntry, UseStateValueEntry } from "../../buildStateChanges.js";
import type { Hook } from "../../../../../hookMapping/types.js";
import type { AnchorEntry } from "../../getHookAnchors.js";

/**
 * Strategy interface for building state changes from component state.
 * Implementations determine how state is resolved and reported for tracked components.
 *
 * Two implementations:
 * - HybridBuilder: Uses fiber traversal + label matching with heuristics (default)
 * - LabelsOnlyBuilder: Uses only explicitly labeled state (cleaner, faster)
 */
export interface StateChangesBuilder {
  /**
   * Builds state changes for a tracked component on mount.
   *
   * @param trackingGUID - The tracking GUID of the component
   * @param useStateValues - Extracted useState entries from fiber (hybrid only)
   * @param anchors - Ordered list of stateful hook anchors (hybrid only)
   * @param allAnchors - Anchor index/value pairs for label resolution (hybrid only)
   * @returns Array of state change entries for initial state
   */
  buildTrackedMount(
    trackingGUID: string,
    useStateValues: UseStateValueEntry[],
    anchors: readonly Hook[],
    allAnchors: AnchorEntry[]
  ): StateChangeEntry[];

  /**
   * Builds state changes for a tracked component on update.
   * May have side effects (e.g., persisting labels for next render).
   *
   * @param trackingGUID - The tracking GUID of the component
   * @param useStateValues - Extracted useState entries from fiber (hybrid only)
   * @param anchors - Ordered list of stateful hook anchors (hybrid only)
   * @param allAnchors - Anchor index/value pairs for label resolution (hybrid only)
   * @returns Array of state change entries for changed state
   */
  buildTrackedUpdate(
    trackingGUID: string,
    useStateValues: UseStateValueEntry[],
    anchors: readonly Hook[],
    allAnchors: AnchorEntry[]
  ): StateChangeEntry[];
}
