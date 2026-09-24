/**
 * Styling options for a single flow trace output category.
 * Defines visual appearance including colors, font weight, and font style.
 *
 * This interface is IDENTICAL to React18's ThemeOptions structure to maintain
 * consistency across the auto-tracer ecosystem.
 *
 * @example
 * ```typescript
 * const asyncStartTheme: ThemeOptions = {
 *   text: "#0044ff",
 *   bold: true
 * };
 * ```
 */
export interface ThemeOptions {
  /**
   * Background color for the log message (CSS color value).
   *
   * @example "#fff0f0" (light red background)
   * @example "rgba(255, 0, 0, 0.1)" (semi-transparent red)
   */
  background?: string;

  /**
   * Text color for the log message (CSS color value).
   *
   * @example "#ff0000" (red text)
   * @example "#0044ff" (blue text)
   */
  text?: string;

  /**
   * Apply bold font weight to the log message.
   *
   * @default false
   */
  bold?: boolean;

  /**
   * Apply italic font style to the log message.
   *
   * @default false
   */
  italic?: boolean;
}
