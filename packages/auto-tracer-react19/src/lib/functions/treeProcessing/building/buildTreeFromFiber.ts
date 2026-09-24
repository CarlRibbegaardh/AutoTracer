import type { TreeNode } from "../types/TreeNode.js";
import { getTraceOptions } from "../../../types/globalState.js";
import { getTrackingGUID } from "../../renderRegistry.js";
import { isTrackedBranch } from "./isTrackedBranch.js";
import { traverseFiber } from "./traverseFiber.js";
import { withTiming } from "./withTiming.js";
import { internalLogger } from "@logger/internalLogger.js";
import type { FiberNode } from "../../../interfaces/FiberNode.js";

/**
 * Builds an array of TreeNodes from a fiber tree.
 * Orchestrates pure traversal and filtering logic with explicit dependencies.
 *
 * @param fiber - Root fiber node
 * @param depth - Starting depth (typically 0)
 * @returns Array of TreeNodes in depth-first order
 */
export function buildTreeFromFiber(
  fiber: FiberNode,
  depth: number,
): readonly TreeNode[] {
  // Read global state once at entry point
  const maxDepth = getTraceOptions().maxFiberDepth ?? 500;
  const includeNonTrackedBranches =
    getTraceOptions().includeNonTrackedBranches ?? true;

  const h = internalLogger.enter(`buildTreeFromFiber: (depth=${depth})`);

  // Build inclusion predicate based on tracking settings
  const shouldIncludeBranch = (fiberNode: FiberNode): boolean => {
    if (includeNonTrackedBranches) {
      return true;
    }

    // Only include if this component or any descendant is tracked
    const isTracked = !!getTrackingGUID(fiberNode);
    return isTracked || isTrackedBranch(fiberNode, getTrackingGUID);
  };

  // Create traversal function with timing wrapper if enabled
  const traverse = withTiming(traverseFiber, "buildTreeFromFiber", true);

  // Execute pure traversal with explicit dependencies
  const result = traverse(fiber, depth, shouldIncludeBranch, maxDepth);

  internalLogger.exit(h);

  return result;
}
