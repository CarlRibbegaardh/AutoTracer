import type { TreeNode } from "../types/TreeNode.js";
import { createIndentedRenderer } from "./renderers/createIndentedRenderer.js";
import { createConsoleGroupRenderer } from "./renderers/createConsoleGroupRenderer.js";
import { getTraceOptions } from "../../../types/globalState.js";
import { internalLogger } from "@logger/internalLogger.js";
import { getReactRuntimeFilteringState } from "../../../runtimeFiltering/getReactRuntimeFilteringState.js";
import { filterTreeNodesByRuntimeNames } from "../../../runtimeFiltering/filterTreeNodesByRuntimeNames.js";

/**
 * Renders an array of tree nodes to the console.
 *
 * IMPURE FUNCTION - Performs I/O (console logging).
 * Total function - handles all node arrays safely.
 *
 * Side effects:
 * - Writes to console
 *
 * @param nodes - Array of tree nodes to render
 */
export function renderTree(nodes: readonly TreeNode[]): void {
  const h = internalLogger.enter(`renderTree: ENTER (${nodes.length} nodes)`);

  const runtimeFiltering = getReactRuntimeFilteringState();
  const filteredNodes = filterTreeNodesByRuntimeNames({
    nodes,
    matchesName: runtimeFiltering.matchesName,
  });

  const treeRenderingMode = getTraceOptions().treeRenderingMode ?? "lineart";

  const renderer =
    treeRenderingMode === "group"
      ? createConsoleGroupRenderer()
      : createIndentedRenderer();

  renderer(filteredNodes);

  internalLogger.exit(h);
}
