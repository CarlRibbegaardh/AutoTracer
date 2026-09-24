import type { TreeNode } from "../types/TreeNode.js";
import { buildTreeNode } from "./buildTreeNode.js";
import { internalLogger } from "@logger/internalLogger.js";
import type { FiberNode } from "../../../interfaces/FiberNode.js";

/**
 * Frame representing a position in the explicit DFS traversal stack.
 *
 * @internal
 * @property fiber - The current fiber-like node to process
 * @property depth - Logical depth of the node used for limits and rendering
 */
interface TraversalFrame {
  fiber: unknown;
  depth: number;
}

/**
 * Traverses a fiber tree and builds TreeNodes for components that pass the filter.
 * Pure function with all dependencies explicitly passed as parameters.
 *
 * Uses stack-based iteration to avoid call stack overflow on deep fiber trees.
 * Processes nodes in depth-first order.
 *
 * @param fiber - Root fiber node to traverse
 * @param startDepth - Starting depth (typically 0)
 * @param shouldIncludeBranch - Predicate determining if a branch should be included
 * @param maxDepth - Maximum traversal depth to prevent infinite loops
 * @returns Array of TreeNodes in depth-first order
 */
export function traverseFiber(
  fiber: FiberNode,
  startDepth: number,
  shouldIncludeBranch: (fiber: FiberNode) => boolean,
  maxDepth: number
): readonly TreeNode[] {
  const h = internalLogger.enter(`traverseFiber: ENTER (depth=${startDepth})`);

  if (!fiber || typeof fiber !== "object") {
    internalLogger.debug("traverseFiber: EXIT (invalid fiber)");

    internalLogger.exit(h);
    return [];
  }

  const accumulator: TreeNode[] = [];
  const stack: TraversalFrame[] = [{ fiber, depth: startDepth }];
  const visited = new WeakSet<object>();

  internalLogger.debug(
    `traverseFiber: Starting loop with ${stack.length} items in stack`
  );

  while (stack.length > 0) {
    const frame = stack.pop();
    if (!frame) continue;

    const { fiber: currentFiber, depth: currentDepth } = frame;

    internalLogger.debug(
      `traverseFiber: Processing fiber at depth ${currentDepth}, stack size: ${stack.length}`
    );

    if (!currentFiber || typeof currentFiber !== "object") {
      continue;
    }

    // Prevent circular references
    if (visited.has(currentFiber)) {
      continue;
    }
    visited.add(currentFiber);

    // Prevent infinite traversal
    if (currentDepth > maxDepth) {
      continue;
    }

    const fiberNode = currentFiber as FiberNode;

    // If this is not a component node, continue traversal without creating a TreeNode
    if (!fiberNode.elementType) {
      // Push sibling first (will be processed after child due to LIFO stack)
      if (fiberNode.sibling) {
        stack.push({ fiber: fiberNode.sibling, depth: currentDepth });
      }
      if (fiberNode.child) {
        stack.push({ fiber: fiberNode.child, depth: currentDepth + 1 });
      }
      continue;
    }

    // Check if we should include this branch
    if (!shouldIncludeBranch(currentFiber)) {
      // Skip this entire branch (no node, no children, continue with siblings)
      if (fiberNode.sibling) {
        stack.push({ fiber: fiberNode.sibling, depth: currentDepth });
      }
      continue;
    }

    // Build the TreeNode for this fiber
    internalLogger.debug(
      `traverseFiber: Building node at depth ${currentDepth}`
    );

    try {
      const node = buildTreeNode(currentFiber, currentDepth);
      accumulator.push(node);
      internalLogger.debug(
        `traverseFiber: Successfully built node at depth ${currentDepth}`
      );
    } catch (error) {
      internalLogger.debug(
        `Error building node at depth ${currentDepth}:`,
        error
      );

      // Continue traversal even if one node fails
    }

    internalLogger.debug(
      `traverseFiber: Pushing children of node at depth ${currentDepth}`
    );

    // Push sibling and child to stack (sibling first for DFS order)
    if (fiberNode.sibling) {
      stack.push({ fiber: fiberNode.sibling, depth: currentDepth });
    }
    if (fiberNode.child) {
      stack.push({ fiber: fiberNode.child, depth: currentDepth + 1 });
    }
  }

  internalLogger.trace(`traverseFiber: EXIT (${accumulator.length} nodes)`);

  internalLogger.exit(h);
  return accumulator;
}
