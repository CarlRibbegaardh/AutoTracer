import type { RequestIdStore } from "./RequestIdStore.js";

/**
 * Creates a session-scoped request identity store.
 *
 * @returns Request identity allocation and reset operations.
 */
export function createRequestIdStore(): RequestIdStore {
  let nextRequestId = 1;

  /** Returns and consumes the next request ID. */
  function getNextRequestId(): number {
    const requestId = nextRequestId;
    nextRequestId += 1;
    return requestId;
  }

  /** Restores request identity for a clean session. */
  function resetRequestIds(): void {
    nextRequestId = 1;
  }

  return {
    getNextRequestId,
    resetRequestIds,
  };
}
