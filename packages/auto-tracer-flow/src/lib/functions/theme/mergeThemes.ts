/**
 * Merges custom theme configuration with default theme.
 * Uses the battle-tested `deepmerge` library for immutable, predictable merging.
 *
 * @param custom - Optional custom theme configuration
 * @returns Complete FlowThemeConfig with custom values merged over defaults
 *
 * @remarks
 * - If no custom theme provided, returns DEFAULT_FLOW_THEME
 * - Deep merges nested ColorOptions properties
 * - Custom properties override default properties at all levels
 * - Undefined values in custom are filtered out before merging
 * - Arrays are replaced (not concatenated) to preserve reference identity
 */

import merge from "deepmerge";
import { DEFAULT_FLOW_THEME } from "../../constants/defaultTheme.js";
import type { FlowThemeConfig } from "../../types/FlowThemeConfig.js";

export function mergeThemes(
  custom: FlowThemeConfig | undefined,
): FlowThemeConfig {
  if (!custom) {
    return DEFAULT_FLOW_THEME;
  }

  const flowThemeConfigKeys: ReadonlyArray<
    | "asyncStart"
    | "asyncComplete"
    | "functionEnter"
    | "functionExit"
    | "parameter"
    | "returnValue"
    | "exception"
    | "runtimeControl"
  > = [
    "asyncStart",
    "asyncComplete",
    "functionEnter",
    "functionExit",
    "parameter",
    "returnValue",
    "exception",
    "runtimeControl",
  ];

  const filteredCustom: Partial<FlowThemeConfig> = {};
  for (const key of flowThemeConfigKeys) {
    const value = custom[key];
    if (value !== undefined) {
      filteredCustom[key] = value;
    }
  }

  // If filtering resulted in empty object, just return defaults
  if (Object.keys(filteredCustom).length === 0) {
    return DEFAULT_FLOW_THEME;
  }

  return merge<FlowThemeConfig>(DEFAULT_FLOW_THEME, filteredCustom, {
    // Replace arrays instead of concatenating (preserves array reference)
    arrayMerge: (_target, source) => {
      return source;
    },
  });
}
