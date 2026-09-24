import type { ReactTracerInternalOptions } from "../types/ReactTracerInternalOptions.js";
import type { OutputMode } from "./OutputMode.js";
import { mapTreeAndValueRenderingModeToOutputMode } from "./mapTreeAndValueRenderingModeToOutputMode.js";

/**
 * Derives outputMode from the current ReactTracer options.
 *
 * Pure function with no side effects.
 *
 * @param options - ReactTracer options
 * @returns Canonical output mode
 */
export function getOutputModeFromReactTracerOptions(
  options: ReactTracerInternalOptions
): OutputMode {
  const treeRenderingMode = options.treeRenderingMode ?? "lineart";
  const valueRenderingMode = options.valueRenderingMode ?? "serialized";

  return mapTreeAndValueRenderingModeToOutputMode(
    treeRenderingMode,
    valueRenderingMode
  );
}
