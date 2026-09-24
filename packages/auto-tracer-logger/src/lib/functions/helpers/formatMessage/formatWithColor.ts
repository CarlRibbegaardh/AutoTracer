/**
 * Formats a message with color styling only.
 * Applies %c directive for console color styling.
 *
 * @param color - The CSS color value
 * @param message - The message to format
 * @returns Formatted message and style parameter
 */
export function formatWithColor(
  color: string,
  message: unknown
): [string, string] {
  const messageStr = String(message);
  const depthMarkersMatch = messageStr.match(/^(?:│\s\s)+/);
  if (!depthMarkersMatch) {
    return [`%c${messageStr}`, `color: ${color}`];
  }

  const depthMarkers = depthMarkersMatch[0];
  const rest = messageStr.substring(depthMarkers.length);
  return [`${depthMarkers}%c${rest}`, `color: ${color}`];
}
