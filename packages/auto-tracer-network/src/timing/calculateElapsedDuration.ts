/**
 * Calculates elapsed monotonic time in milliseconds.
 *
 * @param startMarker - Monotonic marker captured at request start.
 * @param completionMarker - Monotonic marker captured at completion.
 * @returns Elapsed milliseconds.
 */
export function calculateElapsedDuration(
  startMarker: number,
  completionMarker: number,
): number {
  return completionMarker - startMarker;
}
