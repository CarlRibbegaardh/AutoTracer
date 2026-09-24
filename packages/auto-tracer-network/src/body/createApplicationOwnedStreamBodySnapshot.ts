/**
 * Creates the fixed result for an application-owned request stream.
 *
 * @returns An explicit not-captured stream result.
 */
export function createApplicationOwnedStreamBodySnapshot(): {
  readonly status: "not-captured";
  readonly reason: "application-owned request stream";
} {
  return {
    status: "not-captured",
    reason: "application-owned request stream",
  };
}
