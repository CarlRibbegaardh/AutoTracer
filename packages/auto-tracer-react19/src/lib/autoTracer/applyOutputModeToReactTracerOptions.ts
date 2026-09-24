import type { OutputMode } from "./OutputMode.js";
import { mapOutputModeToTreeRenderingMode } from "./mapOutputModeToTreeRenderingMode.js";
import { mapOutputModeToValueRenderingMode } from "./mapOutputModeToValueRenderingMode.js";
import type { ReactTracerRenderingModes } from "../types/ReactTracerRenderingModes.js";

/**
 * Maps the canonical outputMode to the internal ReactTracer options.
 *
 * Pure function with no side effects.
 *
 * @param mode - Canonical output mode
 * @returns ReactTracer options patch
 */
export function applyOutputModeToReactTracerOptions(
  mode: OutputMode
): ReactTracerRenderingModes {
  const treeRenderingMode = mapOutputModeToTreeRenderingMode(mode);
  const valueRenderingMode = mapOutputModeToValueRenderingMode(mode);

  return {
    treeRenderingMode,
    valueRenderingMode,
  };
}
