/**
 * Determines whether admitted requests have reached the automatic-stop limit.
 *
 * @param admittedRequestCount - Included requests admitted in the session.
 * @param autoStopLimit - Included-request limit, or `undefined` when disabled.
 * @returns `true` when automatic stopping must begin.
 */
export function hasReachedAutomaticStopLimit(
  admittedRequestCount: number,
  autoStopLimit: number | undefined,
): boolean {
  return (
    autoStopLimit !== undefined && admittedRequestCount >= autoStopLimit
  );
}
