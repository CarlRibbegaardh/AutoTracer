/**
 * Determines whether another included request fits within the admission limit.
 *
 * @param admittedRequestCount - Number of included requests already admitted.
 * @param autoStopLimit - Included-request limit, or `undefined` when disabled.
 * @returns `true` when the included request may be admitted.
 */
export function shouldAdmitIncludedRequest(
  admittedRequestCount: number,
  autoStopLimit: number | undefined,
): boolean {
  return (
    autoStopLimit === undefined || admittedRequestCount < autoStopLimit
  );
}
