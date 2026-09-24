/**
 * Formats a message with prefix only (no color styling).
 * Applies prefix to each line in multiline messages.
 *
 * @param prefix - The text prefix to prepend
 * @param message - The message to format
 * @returns Formatted message with prefix on each line
 */
export function formatWithPrefix(prefix: string, message: unknown): string {
  const messageStr = String(message);
  const lines = messageStr.split("\n");
  return lines.map((line) => {return `${prefix} ${line}`}).join("\n");
}
