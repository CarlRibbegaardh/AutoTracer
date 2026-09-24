import type { TreeNode } from "../functions/treeProcessing/types/TreeNode.js";
import type { FilterTreeNodesByRuntimeNamesParams } from "./FilterTreeNodesByRuntimeNamesParams.js";

/**
 * Filters a flattened TreeNode list by runtime component name filters.
 *
 * Semantics:
 * - When a node's displayName matches, the node and its subtree are removed.
 * - Subtree membership is determined by depth in the pre-order flattened list.
 *
 * @param params - Filtering inputs
 * @returns Filtered node list
 */
export function filterTreeNodesByRuntimeNames(
  params: FilterTreeNodesByRuntimeNamesParams
): readonly TreeNode[] {
  /**
   * Returns true when the current node should begin subtree skipping.
   */
  function shouldStartSkipping(node: TreeNode): boolean {
    return params.matchesName(node.displayName);
  }

  const out: TreeNode[] = [];
  let skipDepth: number | undefined;

  for (const node of params.nodes) {
    if (skipDepth !== undefined && node.depth > skipDepth) {
      continue;
    }

    if (skipDepth !== undefined && node.depth <= skipDepth) {
      skipDepth = undefined;
    }

    if (node.renderType !== "Marker" && shouldStartSkipping(node)) {
      skipDepth = node.depth;
      continue;
    }

    out.push(node);
  }

  return out;
}
