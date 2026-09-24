import type { Theme } from "../../types/Theme.js";
import { setThemeInternal } from "./theme.js";

/**
 * Sets the current theme configuration.
 * Replaces the entire theme.
 *
 * @param theme - The new theme to apply
 */
export function setTheme(theme: Theme): void {
  setThemeInternal(theme);
}
