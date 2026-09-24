import type { TreeNode } from "../functions/treeProcessing/types/TreeNode.js";

/**
 * Parameters for filtering a flattened TreeNode list by runtime component-name filters.
 */
export type FilterTreeNodesByRuntimeNamesParams = {
  /**
   * Flattened pre-order tree node list.
   */
  readonly nodes: readonly TreeNode[];

  /**
   * Returns true when a component name matches the runtime filter set.
   */
  readonly matchesName: (name: string) => boolean;
};
