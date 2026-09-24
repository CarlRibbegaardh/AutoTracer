/**
 * Merges custom theme configuration with default theme.
 * Uses the battle-tested `deepmerge` library for immutable, predictable merging.
 *
 * @param custom - Optional custom theme configuration
 * @returns Complete React theme configuration with custom values merged over defaults
 *
 * @remarks
 * - If no custom theme provided, returns default colors from defaultReactTracerOptions
 * - Deep merges nested ColorOptions properties
 * - Custom properties override default properties at all levels
 * - Undefined values in custom are filtered out before merging
 * - Arrays are replaced (not concatenated) to preserve reference identity
 */

import merge from "deepmerge";
import { defaultReactTracerOptions } from "../../types/defaultSettings.js";
import type { ReactTracerOptions } from "../../interfaces/ReactTracerOptions.js";

type ReactThemeConfig = Required<NonNullable<ReactTracerOptions["colors"]>>;

export function mergeThemes(
  custom: Partial<ReactThemeConfig> | undefined
): ReactThemeConfig {
  const DEFAULT_REACT_THEME = defaultReactTracerOptions.colors! as ReactThemeConfig;

  if (!custom) {
    return DEFAULT_REACT_THEME;
  }

  // Filter out undefined values from custom before merging
  const filteredCustom: Record<string, unknown> = Object.fromEntries(
    Object.entries(custom).filter(([_, value]) => {
      return value !== undefined;
    })
  );

  // If filtering resulted in empty object, just return defaults
  if (Object.keys(filteredCustom).length === 0) {
    return DEFAULT_REACT_THEME;
  }

  return merge(DEFAULT_REACT_THEME, filteredCustom, {
    // Replace arrays instead of concatenating (preserves array reference)
    arrayMerge: (_target, source) => {
      return source;
    },
  }) as ReactThemeConfig;
}
