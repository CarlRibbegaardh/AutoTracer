import type { Theme } from "../../types/Theme.js";

/**
 * Default theme configuration.
 * Uses console.group mode with no colors or prefixes.
 */
const defaultTheme: Theme = {
  colors: {},
  prefixes: {},
};

/**
 * Current theme state.
 * Controls visual styling of all log output.
 * Internal module state - not exported directly.
 */
let currentTheme: Theme = defaultTheme;

/**
 * Gets the current theme.
 *
 * @returns The current theme configuration
 * @internal
 */
export function getThemeInternal(): Theme {
  return currentTheme;
}

/**
 * Sets the current theme.
 * Replaces the entire theme configuration.
 *
 * @param theme - The new theme to set
 * @internal
 */
export function setThemeInternal(theme: Theme): void {
  currentTheme = theme;
}
