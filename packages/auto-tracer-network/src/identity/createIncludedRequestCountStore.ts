import type { IncludedRequestCountStore } from "./IncludedRequestCountStore.js";

/**
 * Creates a session-scoped included-request admission count store.
 *
 * @returns Included-request admission count operations.
 */
export function createIncludedRequestCountStore(): IncludedRequestCountStore {
  let admittedRequestCount = 0;

  /** Returns the current included-request admission count. */
  function getAdmittedRequestCount(): number {
    return admittedRequestCount;
  }

  /** Replaces the included-request admission count. */
  function setAdmittedRequestCount(count: number): void {
    admittedRequestCount = count;
  }

  /** Resets the included-request admission count. */
  function resetAdmittedRequestCount(): void {
    admittedRequestCount = 0;
  }

  return {
    getAdmittedRequestCount,
    setAdmittedRequestCount,
    resetAdmittedRequestCount,
  };
}
