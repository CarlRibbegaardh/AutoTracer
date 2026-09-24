/**
 * Warns if a task took longer than 1 second to complete.
 * Side-effecting function that outputs to console.warn.
 *
 * @param elapsed - Elapsed time in milliseconds
 * @param label - The task label
 */
export function warnIfSlow(elapsed: number, label: string): void {
  if (elapsed > 1000) {
    console.warn(
      `⚠️ Task "${label}" took ${(elapsed / 1000).toFixed(2)}s to complete.`
    );
  }
}
