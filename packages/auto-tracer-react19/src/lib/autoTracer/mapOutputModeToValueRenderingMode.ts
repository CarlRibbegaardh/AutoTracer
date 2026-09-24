import type { OutputMode } from "./OutputMode.js";

/**
 * Maps the canonical `outputMode` to the spec vocabulary `valueRenderingMode`.
 *
 * Pure function with no side effects.
 *
 * @param outputMode - Canonical output mode
 * @returns Value rendering mode in the spec vocabulary
 */
export function mapOutputModeToValueRenderingMode(
  outputMode: OutputMode
): "as-is" | "serialized" {
  return outputMode === "devtools" ? "as-is" : "serialized";
}
