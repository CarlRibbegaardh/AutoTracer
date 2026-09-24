import type { ThemeOptions } from "../../types/ThemeOptions.js";

/**
 * Applies theme styling to a log message using CSS formatting for console output.
 * This is a pure function that builds a formatted string with embedded CSS styling.
 *
 * The returned string includes both the message with %c placeholders AND the CSS string
 * concatenated together, which can be split by the caller for use with console.log.
 *
 * @param message - The message to format
 * @param theme - Theme options (colors, bold, italic)
 * @param icon - Optional icon or prefix to prepend to the message
 * @returns Formatted message string with embedded CSS (e.g., "%cmessage%ccolor: #ff0000"), or plain message if no styling
 *
 * @example
 * ```typescript
 * // No styling
 * applyTheme("hello", {}); // Returns: "hello"
 *
 * // With styling - returns message with CSS embedded
 * applyTheme("error", { text: "#ff0000", bold: true }, "💥");
 * // Returns: "%c💥 error%ccolor: #ff0000; font-weight: bold"
 *
 * // The caller can extract CSS for console.log by checking for %c
 * const result = applyTheme("test", { text: "#ff0000" });
 * if (result.includes("%c")) {
 *   // Split on last %c to get [message, css]
 * }
 * ```
 *
 * @remarks
 * This function adheres to strict functional programming principles:
 * - Pure function: same inputs always produce same output
 * - No side effects: doesn't mutate inputs or access external state
 * - Max 3 parameters: follows project composition rules
 * - Independently testable: no dependencies on logger or other modules
 */
export function applyTheme(
  message: string,
  theme: ThemeOptions,
  icon?: string
): string {
  // Build icon prefix if provided
  const prefixedMessage = icon ? `${icon} ${message}` : message;

  // Check if any styling is actually defined
  const hasStyle =
    theme.text !== undefined ||
    theme.background !== undefined ||
    theme.bold === true ||
    theme.italic === true;

  // Return plain message if no styling
  if (!hasStyle) {
    return prefixedMessage;
  }

  // Build CSS style string
  const styles: string[] = [];

  if (theme.text !== undefined) {
    styles.push(`color: ${theme.text}`);
  }

  if (theme.background !== undefined) {
    styles.push(`background: ${theme.background}`);
  }

  if (theme.bold === true) {
    styles.push("font-weight: bold");
  }

  if (theme.italic === true) {
    styles.push("font-style: italic");
  }

  const css = styles.join("; ");

  // Return formatted string with %c placeholders AND CSS embedded
  // Format: "%cMESSAGE%cCSS" where the CSS is after the second %c
  // This allows the caller to extract the CSS by splitting on the last %c
  return `%c${prefixedMessage}%c${css}`;
}
