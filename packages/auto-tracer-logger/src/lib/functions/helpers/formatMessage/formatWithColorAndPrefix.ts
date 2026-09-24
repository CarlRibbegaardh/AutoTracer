/**
 * Formats a message with both color and prefix styling.
 * Applies %c directive for console color styling.
 *
 * @param prefix - The text prefix to prepend
 * @param color - The CSS color value
 * @param message - The message to format
 * @returns Formatted message and style parameter
 */
export function formatWithColorAndPrefix(
  prefix: string,
  color: string,
  message: unknown
): [string, string] {
  return [`%c${prefix} ${message}`, `color: ${color}`];
}
