import type { ColorOptions } from "./ColorOptions.js";

/**
 * Complete theme configuration for flow tracing output.
 * Defines visual styling for all semantic categories of flow trace messages.
 *
 * Follows the SAME pattern as React18's colors configuration, using ColorOptions
 * for each semantic category to maintain consistency across the auto-tracer ecosystem.
 *
 * All fields are optional - missing categories will use default styling.
 *
 * @example
 * ```typescript
 * const theme: FlowThemeConfig = {
 *   asyncStart: {
 *     lightMode: { text: "#0044ff", bold: true },
 *     darkMode: { text: "#4fd6ff", bold: true },
 *     icon: "🚀"
 *   },
 *   exception: {
 *     lightMode: { text: "#ff0000", background: "#fff0f0", bold: true },
 *     darkMode: { text: "#fca5a5", background: "#3f1f1f", bold: true },
 *     icon: "💥"
 *   }
 * };
 * ```
 */
export interface FlowThemeConfig {
  /**
   * Styling for async function start messages.
   *
   * Format: "functionName (async started)"
   *
   * @example
   * ```typescript
   * asyncStart: {
   *   lightMode: { text: "#0044ff", bold: true },
   *   darkMode: { text: "#4fd6ff", bold: true },
   *   icon: "🚀"
   * }
   * ```
   */
  asyncStart?: ColorOptions;

  /**
   * Styling for async function completion messages.
   *
   * Format: "functionName (async completed)"
   *
   * @example
   * ```typescript
   * asyncComplete: {
   *   lightMode: { text: "#00aa00", bold: true },
   *   darkMode: { text: "#4ade80", bold: true },
   *   icon: "✅"
   * }
   * ```
   */
  asyncComplete?: ColorOptions;

  /**
   * Styling for synchronous function entry (group start).
   *
   * Format: "→ functionName" (in default mode: console.group)
   *
   * @example
   * ```typescript
   * functionEnter: {
   *   lightMode: { text: "#666666", bold: true },
   *   darkMode: { text: "#9ca3af", bold: true },
   *   icon: "→"
   * }
   * ```
   */
  functionEnter?: ColorOptions;

  /**
   * Styling for synchronous function exit (elapsed time message).
   *
   * Format: "← functionName (elapsed: 1.2ms)"
   *
   * @example
   * ```typescript
   * functionExit: {
   *   lightMode: { text: "#666666", bold: true },
   *   darkMode: { text: "#9ca3af", bold: true },
   *   icon: "←"
   * }
   * ```
   */
  functionExit?: ColorOptions;

  /**
   * Styling for parameter logging.
   *
   * Format: "param paramName: value"
   *
   * @example
   * ```typescript
   * parameter: {
   *   lightMode: { text: "#9966ff", italic: true },
   *   darkMode: { text: "#c4b5fd", italic: true }
   * }
   * ```
   */
  parameter?: ColorOptions;

  /**
   * Styling for return value logging.
   *
   * Format: "returned: value"
   *
   * @example
   * ```typescript
   * returnValue: {
   *   lightMode: { text: "#00aaaa" },
   *   darkMode: { text: "#5eead4" }
   * }
   * ```
   */
  returnValue?: ColorOptions;

  /**
   * Styling for exception logging.
   *
   * Format: "💥 Exception in functionName: Error"
   *
   * @example
   * ```typescript
   * exception: {
   *   lightMode: { text: "#ff0000", background: "#fff0f0", bold: true },
   *   darkMode: { text: "#fca5a5", background: "#3f1f1f", bold: true },
   *   icon: "💥"
   * }
   * ```
   */
  exception?: ColorOptions;

  /**
   * Styling for runtime control messages.
   *
   * Examples: "Flow tracing started", "Flow tracing stopped",
   * "🔧 Flow tracing runtime control ready..."
   *
   * @example
   * ```typescript
   * runtimeControl: {
   *   lightMode: { text: "#888888" },
   *   darkMode: { text: "#9ca3af" },
   *   icon: "🔧"
   * }
   * ```
   */
  runtimeControl?: ColorOptions;
}
