import type { ThemeOptions } from "./ThemeOptions.js";

/**
 * Color configuration with light/dark mode support and optional icon.
 * Combines mode-specific styling with a mode-independent icon.
 *
 * This interface is IDENTICAL to React18's ColorOptions structure to maintain
 * consistency across the auto-tracer ecosystem.
 *
 * @example
 * ```typescript
 * const asyncStartColor: ColorOptions = {
 *   lightMode: { text: "#0044ff", bold: true },
 *   darkMode: { text: "#4fd6ff", bold: true },
 *   icon: "🚀"
 * };
 * ```
 */
export interface ColorOptions {
  /**
   * Theme styling to apply when the system is in dark mode.
   * Detected automatically via browser's prefers-color-scheme.
   */
  darkMode?: ThemeOptions;

  /**
   * Theme styling to apply when the system is in light mode.
   * Detected automatically via browser's prefers-color-scheme.
   */
  lightMode?: ThemeOptions;

  /**
   * Icon or text prefix to display with the log message.
   * Applied regardless of light/dark mode.
   *
   * @example "🚀" (async start)
   * @example "✅" (async complete)
   * @example "💥" (exception)
   * @example "→" (function enter)
   */
  icon?: string;
}
