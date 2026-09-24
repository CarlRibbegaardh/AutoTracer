/**
 * Maps Flow group mode values to the spec vocabulary `treeRenderingMode`.
 *
 * Pure function with no side effects.
 *
 * @param mode - Flow group mode
 * @returns Tree rendering mode in the spec vocabulary
 */
export function mapFlowGroupModeToTreeRenderingMode(
  mode: "default" | "text"
): "group" | "lineart" {
  return mode === "default" ? "group" : "lineart";
}
