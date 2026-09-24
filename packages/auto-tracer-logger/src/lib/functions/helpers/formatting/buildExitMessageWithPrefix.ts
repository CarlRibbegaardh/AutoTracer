/**
 * Builds an exit message with optional prefix.
 *
 * @param elapsedMessage - The elapsed time message (e.g., "myFunc (elapsed: 10.5ms)")
 * @param exitPrefix - Optional prefix to prepend (e.g., "←")
 * @returns The formatted exit message with prefix if provided
 */
export function buildExitMessageWithPrefix(
  elapsedMessage: string,
  exitPrefix: string
): string {
  return exitPrefix ? `${exitPrefix} ${elapsedMessage}` : elapsedMessage;
}
