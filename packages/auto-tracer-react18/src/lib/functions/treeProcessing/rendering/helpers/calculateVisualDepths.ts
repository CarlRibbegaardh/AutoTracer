import type { TreeNode } from "../../types/TreeNode.js";
import { internalLogger } from "@logger/internalLogger.js";

/**
 * Calculates visual depths for filtered tree nodes.
 *
 * Visual depth reflects the node's position in the filtered structure,
 * while original depth (in TreeNode) is preserved for debugging labels.
 *
 * Markers represent collapsed space between nodes, not tree nodes themselves:
 * - Marker after component, same/higher original level → same visual depth (siblings)
 * - Marker after component, lower original level → use tracked depth for that level
 * - Component after marker → marker depth + 1 (child of what marker represents)
 * - Component after component → based on original depth relationship
 *
 * Tracks visual depth for each original level to maintain consistency when
 * markers go back to previously seen levels.
 *
 * Pure function - no side effects, deterministic.
 * Total function - handles all node arrays.
 *
 * @param nodes - Array of tree nodes (filtered)
 * @returns Array of visual depths corresponding to each node
 */
export function calculateVisualDepths(
  nodes: readonly TreeNode[]
): readonly number[] {
  const visualDepths: number[] = [];
  let currentVisualDepth = 0;
  // Track the visual depth assigned to each original level
  const levelToVisualDepth = new Map<number, number>();

  // DEBUG: Log first 10 nodes to diagnose the issue
  if (nodes.length > 0 && nodes[0]?.depth === 20) {
    internalLogger.info("calculateVisualDepths - First 10 nodes:");
    for (let j = 0; j < Math.min(10, nodes.length); j++) {
      const n = nodes[j];
      const nodeType = n?.renderType === "Marker" ? "M" : "C";
      const nodeName = n?.renderType !== "Marker" ? n?.displayName ?? "" : "";
      internalLogger.info(`  [${j}] ${nodeType}(${n?.depth}) ${nodeName}`);
    }
  }

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const prevNode = i > 0 ? nodes[i - 1] : null;

    if (i === 0 || node === undefined) {
      // First node starts at visual depth 0
      visualDepths.push(0);
      currentVisualDepth = 0;
      levelToVisualDepth.set(node?.depth ?? 0, 0);
    } else if (prevNode !== null && prevNode !== undefined) {
      const isCurrentMarker = node.renderType === "Marker";
      const isPreviousMarker = prevNode.renderType === "Marker";
      const prevOriginalDepth = prevNode.depth;
      const currentOriginalDepth = node.depth;

      if (isCurrentMarker) {
        // Markers are virtual - they represent filtered nodes
        // A marker's visual depth should match the context it appears in

        if (currentOriginalDepth < prevOriginalDepth) {
          // Marker going UP the tree (lower original level)
          // Use the previously established visual depth for this level
          const trackedDepth = levelToVisualDepth.get(currentOriginalDepth);
          if (trackedDepth !== undefined) {
            // We've seen this level before, use its visual depth
            currentVisualDepth = trackedDepth;
          } else {
            // First time at this level while going back, calculate based on decrease
            const depthDecrease = prevOriginalDepth - currentOriginalDepth;
            currentVisualDepth = Math.max(
              0,
              currentVisualDepth - depthDecrease
            );
          }
          visualDepths.push(currentVisualDepth);
          levelToVisualDepth.set(currentOriginalDepth, currentVisualDepth);
        } else {
          // Marker at same or deeper level
          // Keep the same visual depth (markers don't increase depth)
          visualDepths.push(currentVisualDepth);
          if (currentOriginalDepth <= prevOriginalDepth) {
            levelToVisualDepth.set(currentOriginalDepth, currentVisualDepth);
          }
        }
      } else if (isPreviousMarker) {
        // Component after marker
        if (currentOriginalDepth < prevOriginalDepth) {
          // Component is shallower than marker: goes back to root level
          currentVisualDepth = 0;
          visualDepths.push(currentVisualDepth);
          levelToVisualDepth.set(currentOriginalDepth, currentVisualDepth);
        } else {
          // Component is SAME or DEEPER: child of marker
          const prevVisualDepth = visualDepths[i - 1] ?? 0;
          currentVisualDepth = prevVisualDepth + 1;
          visualDepths.push(currentVisualDepth);
          levelToVisualDepth.set(currentOriginalDepth, currentVisualDepth);
        }
      } else {
        // Component after component: use original depth relationship
        if (currentOriginalDepth > prevOriginalDepth) {
          // Child: increase visual depth by 1
          currentVisualDepth++;
          visualDepths.push(currentVisualDepth);
          levelToVisualDepth.set(currentOriginalDepth, currentVisualDepth);
        } else if (currentOriginalDepth === prevOriginalDepth) {
          // Sibling: same visual depth
          visualDepths.push(currentVisualDepth);
          levelToVisualDepth.set(currentOriginalDepth, currentVisualDepth);
        } else {
          // Parent/uncle: decrease visual depth
          // Use tracked depth if available, otherwise calculate
          const trackedDepth = levelToVisualDepth.get(currentOriginalDepth);
          if (trackedDepth !== undefined) {
            currentVisualDepth = trackedDepth;
          } else {
            const depthDecrease = prevOriginalDepth - currentOriginalDepth;
            currentVisualDepth = Math.max(
              0,
              currentVisualDepth - depthDecrease
            );
          }
          visualDepths.push(currentVisualDepth);
          levelToVisualDepth.set(currentOriginalDepth, currentVisualDepth);
        }
      }
    }
  }

  // DEBUG: Log calculated depths for first 10 nodes
  if (nodes.length > 0 && nodes[0]?.depth === 20) {
    internalLogger.info(
      "calculateVisualDepths - Calculated depths for first 10 nodes:"
    );
    for (let j = 0; j < Math.min(10, nodes.length); j++) {
      const n = nodes[j];
      const nodeType = n?.renderType === "Marker" ? "M" : "C";
      const nodeName = n?.renderType !== "Marker" ? n?.displayName ?? "" : "";
      internalLogger.info(
        `  [${j}] ${nodeType}(${n?.depth}) ${nodeName} → visual depth ${visualDepths[j]}`
      );
    }
  }

  return visualDepths;
}
