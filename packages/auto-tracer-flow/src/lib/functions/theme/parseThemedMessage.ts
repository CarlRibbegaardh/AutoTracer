/**
 * Parses a themed message string from applyTheme into message and CSS parts.
 *
 * @param themedMessage - Formatted string from applyTheme (e.g., "%cmessage%ccss")
 * @returns Object with message and optional CSS string
 *
 * @remarks
 * - If message contains no %c markers, returns message as-is with no CSS
 * - Splits on the LAST %c to separate message from CSS
 * - Pure function with no side effects
 *
 * @example
 * ```typescript
 * parseThemedMessage("%chello%ccolor: red");
 * // Returns: { message: "%chello", css: "color: red" }
 *
 * parseThemedMessage("plain");
 * // Returns: { message: "plain", css: undefined }
 * ```
 */
export function parseThemedMessage(themedMessage: string): {
  message: string;
  css: string | undefined;
} {
  // Check if message has %c markers
  const lastMarkerIndex = themedMessage.lastIndexOf("%c");

  if (lastMarkerIndex === -1) {
    // No styling
    return {
      message: themedMessage,
      css: undefined,
    };
  }

  // Check if there's a second %c (first marker at position 0 or later)
  const firstMarkerIndex = themedMessage.indexOf("%c");

  if (firstMarkerIndex === lastMarkerIndex) {
    // Only one %c marker - malformed, treat as plain message
    return {
      message: themedMessage,
      css: undefined,
    };
  }

  // Split on last %c: everything before is message, everything after is CSS
  const message = themedMessage.substring(0, lastMarkerIndex);
  const css = themedMessage.substring(lastMarkerIndex + 2); // Skip "%c"

  return { message, css };
}
