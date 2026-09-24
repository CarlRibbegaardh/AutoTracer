/**
 * Formats an elapsed monotonic duration for a lifecycle row.
 *
 * @param milliseconds - Elapsed duration in milliseconds.
 * @returns Milliseconds below one second or seconds with two decimal places.
 */
export function formatElapsedDuration(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds} ms`;
  }

  return `${(milliseconds / 1000).toFixed(2)} s`;
}
