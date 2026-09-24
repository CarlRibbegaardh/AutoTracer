/**
 * Formats a label with elapsed time.
 * Pure function with no side effects.
 *
 * @param label - The operation label
 * @param elapsed - Elapsed time in milliseconds
 * @returns Formatted message: "label (elapsed: Xms)"
 */
export function calculateElapsedMessage(label: string, elapsed: number): string {
  return `${label} (elapsed: ${elapsed.toFixed(2)}ms)`;
}
