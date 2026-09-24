import type { OutputMode } from "./OutputMode.js";

/**
 * Derives the canonical `outputMode` from internal rendering modes.
 *
 * Pure function with no side effects.
 *
 * @param treeRenderingMode - Structural output mode in the spec vocabulary
 * @param valueRenderingMode - Value rendering mode in the spec vocabulary
 * @returns Canonical output mode
 */
export function mapTreeAndValueRenderingModeToOutputMode(
  treeRenderingMode: "group" | "lineart",
  valueRenderingMode: "as-is" | "serialized"
): OutputMode {
  const isDevtoolsMode =
    treeRenderingMode === "group" && valueRenderingMode === "as-is";

  return isDevtoolsMode ? "devtools" : "copy-paste";
}
