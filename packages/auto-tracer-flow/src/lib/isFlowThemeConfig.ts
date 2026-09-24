import type { FlowThemeConfig } from "./types/FlowThemeConfig.js";
import { validateTheme } from "./functions/theme/validateTheme.js";
import { isRecord } from "./isRecord.js";

/**
 * Checks whether a value satisfies the FlowThemeConfig shape.
 *
 * @param value - Unknown value.
 * @returns True when value behaves like a FlowThemeConfig.
 */
export function isFlowThemeConfig(value: unknown): value is FlowThemeConfig {
  if (!isRecord(value)) {
    return false;
  }

  return validateTheme(value, "__FLOWTRACER_THEME__").length === 0;
}
