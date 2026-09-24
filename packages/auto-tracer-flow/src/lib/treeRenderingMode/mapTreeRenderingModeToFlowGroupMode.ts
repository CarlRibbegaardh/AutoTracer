/**
 * Maps the spec vocabulary `treeRenderingMode` to Flow group mode values.
 *
 * Pure function with no side effects.
 *
 * @param mode - Tree rendering mode in the spec vocabulary
 * @returns Flow group mode
 */
export function mapTreeRenderingModeToFlowGroupMode(
  mode: "group" | "lineart"
): "default" | "text" {
  return mode === "group" ? "default" : "text";
}
