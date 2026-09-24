/**
 * Exposes session request identity operations.
 */
export interface RequestIdStore {
  /** Returns and consumes the next request ID in the active session. */
  readonly getNextRequestId: () => number;

  /** Resets request identity for a clean session. */
  readonly resetRequestIds: () => void;
}
