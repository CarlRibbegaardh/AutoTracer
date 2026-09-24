import { getThemeInternal } from "./theme.js";

/**
 * Gets the current theme configuration.
 *
 * @returns The current theme
 */
export function getTheme() {
  return getThemeInternal();
}
