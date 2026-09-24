/**
 * Selects the appropriate theme mode (light or dark) from ColorOptions.
 *
 * @param colors - ColorOptions with light and/or dark mode themes
 * @param scheme - Detected color scheme ("light" or "dark")
 * @returns ThemeOptions for the selected mode, or empty object if none available
 *
 * @remarks
 * - If requested mode is not available, falls back to the other mode
 * - If neither mode is available, returns empty ThemeOptions
 * - Pure function with no side effects
 *
 * @example
 * ```typescript
 * const colors = {
 *   lightMode: { text: "#000" },
 *   darkMode: { text: "#fff" }
 * };
 *
 * selectThemeMode(colors, "light");
 * // Returns: { text: "#000" }
 *
 * selectThemeMode(colors, "dark");
 * // Returns: { text: "#fff" }
 * ```
 */

import type { ColorOptions } from "../../types/ColorOptions.js";
import type { ThemeOptions } from "../../types/ThemeOptions.js";

export function selectThemeMode(
  colors: ColorOptions | undefined,
  scheme: "light" | "dark"
): ThemeOptions {
  if (!colors) {
    return {};
  }

  // Try to get requested mode first
  const requested = scheme === "light" ? colors.lightMode : colors.darkMode;
  if (requested) {
    return requested;
  }

  // Fall back to other mode if requested mode is not available
  const fallback = scheme === "light" ? colors.darkMode : colors.lightMode;
  if (fallback) {
    return fallback;
  }

  // No modes available
  return {};
}
