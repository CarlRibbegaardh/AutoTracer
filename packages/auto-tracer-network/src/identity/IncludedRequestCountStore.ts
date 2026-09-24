/**
 * Exposes session-scoped included-request admission count operations.
 */
export interface IncludedRequestCountStore {
  /** Returns the number of included requests admitted in the session. */
  readonly getAdmittedRequestCount: () => number;

  /**
   * Replaces the included-request admission count.
   *
   * @param count - Updated included-request admission count.
   */
  readonly setAdmittedRequestCount: (count: number) => void;

  /** Resets the included-request admission count for a clean session. */
  readonly resetAdmittedRequestCount: () => void;
}
