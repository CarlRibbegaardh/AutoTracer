import type { OutputMode } from "./OutputMode.js";

/**
 * Maps the canonical `outputMode` to the spec vocabulary `treeRenderingMode`.
 *
 * Pure function with no side effects.
 *
 * @param outputMode - Canonical output mode
 * @returns Tree rendering mode in the spec vocabulary
 */
export function mapOutputModeToTreeRenderingMode(
  outputMode: OutputMode
): "group" | "lineart" {
  return outputMode === "devtools" ? "group" : "lineart";
}
