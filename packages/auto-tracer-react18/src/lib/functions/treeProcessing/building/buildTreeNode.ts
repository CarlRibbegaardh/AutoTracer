import type { TreeNode } from "../types/TreeNode.js";
import type { Hook } from "../../hookMapping/types.js";
import { extractUseStateValues } from "../../extractUseStateValues.js";
import { getComponentName } from "../../getComponentName.js";
import { getRealComponentName } from "../../getRealComponentName.js";
import { getTrackedName, getTrackingGUID } from "../../renderRegistry.js";
import { determineRenderType } from "./helpers/determineRenderType.js";
import { getHookAnchors } from "./helpers/getHookAnchors.js";
import {
  type StateChangeEntry,
  buildStateChanges,
} from "./helpers/buildStateChanges.js";
import { createStateChangesBuilder } from "./helpers/buildStateChanges/createStateChangesBuilder.js";
import { buildPropChanges } from "./helpers/buildPropChanges.js";
import { computeIdenticalValueWarning } from "./helpers/computeIdenticalValueWarning.js";
import { consumeComponentLogs } from "./helpers/consumeComponentLogs.js";
import { internalLogger } from "@logger/internalLogger.js";
//import { attemptFiberCapture } from "../../hookLabels/captureFiberFixture.js";
import type { FiberNode } from "../../../interfaces/FiberNode.js";

/**
 * Builds a TreeNode from a React fiber node.
 *
 * Pure function - extracts data without modifying the fiber.
 * Total function - handles all fiber inputs safely.
 *
 * @param fiber - The React fiber node
 * @param depth - Current depth in the tree
 * @returns Immutable TreeNode representation
 */
export function buildTreeNode(
  fiberNode: FiberNode | null,
  depth: number
): TreeNode {
  const h = internalLogger.enter(`buildTreeNode: ENTER (depth=${depth})`);

  if (!fiberNode || typeof fiberNode !== "object") {
    throw new Error("buildTreeNode requires a valid fiber object");
  }

  // Extract component name
  internalLogger.debug(`buildTreeNode: Extracting component name`);

  const componentName = getComponentName(fiberNode.elementType) ?? "Unknown";
  const displayName = getRealComponentName(fiberNode);

  internalLogger.debug(`buildTreeNode: Component name is ${componentName}`);
  // TEMPORARY: Attempt to capture fiber for test fixture generation
  // Determine if this is a mount (new component instance)
  const isNewMount = !fiberNode.alternate;

  // Check if component is tracked
  internalLogger.debug(`buildTreeNode: Getting tracking GUID`);
  const trackingGUID = getTrackingGUID(fiberNode);
  const isTracked = !!trackingGUID;

  // Use tracked name if available (handles minification)
  let finalDisplayName = displayName;
  if (trackingGUID) {
    const trackedName = getTrackedName(trackingGUID);
    if (trackedName) {
      finalDisplayName = trackedName;
    }
  }

  // if (trackingGUID && fiberNode.memoizedState) {
  //   attemptFiberCapture([], fiberNode, componentName, 0, trackingGUID);
  // }

  // Determine render type
  internalLogger.debug(`buildTreeNode: Determining render type`);

  const renderType: TreeNode["renderType"] = determineRenderType(
    isNewMount,
    fiberNode.flags
  );

  // Extract state changes
  internalLogger.debug(`buildTreeNode: Extracting useState values`);

  const useStateValues = extractUseStateValues(fiberNode);

  // Get hook anchors for label resolution from CURRENT render's memoized state
  internalLogger.debug(`buildTreeNode: Getting hook anchors`);

  const memoizedState = fiberNode.memoizedState as Hook | null;
  const { anchors, allAnchors } = getHookAnchors(memoizedState);

  internalLogger.debug(`buildTreeNode: Building state changes`);

  // For tracked components, use strategy pattern based on configuration
  // For untracked components, always use hybrid (fiber-based) approach
  const stateChanges: StateChangeEntry[] = trackingGUID
    ? (() => {
        const stateChangesBuilder = createStateChangesBuilder();
        return isNewMount
          ? stateChangesBuilder.buildTrackedMount(
              trackingGUID,
              useStateValues,
              anchors,
              allAnchors
            )
          : stateChangesBuilder.buildTrackedUpdate(
              trackingGUID,
              useStateValues,
              anchors,
              allAnchors
            );
      })()
    : buildStateChanges(
        isNewMount,
        useStateValues,
        anchors,
        allAnchors,
        null // untracked
      );

  // Extract prop changes
  internalLogger.debug(`buildTreeNode: Building prop changes`);

  const propChanges = buildPropChanges(isNewMount, fiberNode, finalDisplayName);

  // Check if any change has identical value warning
  internalLogger.debug(`buildTreeNode: Computing identical value warning`);

  const hasIdenticalValueWarning = computeIdenticalValueWarning(
    stateChanges,
    propChanges
  );

  // Get component logs if tracked (logs are keyed by GUID)
  internalLogger.debug(`buildTreeNode: Consuming component logs`);

  const componentLogs = consumeComponentLogs(trackingGUID || null);

  internalLogger.exit(h);

  return {
    depth,
    componentName,
    displayName: finalDisplayName,
    renderType,
    flags: fiberNode.flags ?? 0,
    stateChanges,
    propChanges,
    componentLogs,
    isTracked,
    trackingGUID: trackingGUID || null,
    hasIdenticalValueWarning,
  };
}
