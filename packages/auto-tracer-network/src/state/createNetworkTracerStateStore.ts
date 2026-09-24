import type { NetworkTracerState } from "./NetworkTracerState.js";
import type { NetworkTracerStateStore } from "./NetworkTracerStateStore.js";

/**
 * Creates an internal NetworkTracer lifecycle state store.
 *
 * @param enabledOnLoad - Whether the initial state accepts new requests.
 * @returns Lifecycle state and pending-work operations.
 */
export function createNetworkTracerStateStore(
  enabledOnLoad: boolean,
): NetworkTracerStateStore {
  let state: NetworkTracerState = enabledOnLoad ? "running" : "stopped";
  let pendingRequestCount = 0;

  /** Returns the current lifecycle state. */
  function getState(): NetworkTracerState {
    return state;
  }

  /** Returns whether new requests are accepted. */
  function isEnabled(): boolean {
    return state === "running";
  }

  /** Returns pending logging-work count. */
  function getPendingRequestCount(): number {
    return pendingRequestCount;
  }

  /** Enters the running state. */
  function enterRunning(): void {
    state = "running";
  }

  /** Enters the stopping state. */
  function enterStopping(): void {
    state = "stopping";
  }

  /** Enters the stopped state. */
  function enterStopped(): void {
    state = "stopped";
  }

  /** Adds one pending logging-work item. */
  function beginPendingWork(): void {
    pendingRequestCount += 1;
  }

  /** Settles one pending logging-work item without allowing underflow. */
  function settlePendingWork(): void {
    pendingRequestCount = Math.max(0, pendingRequestCount - 1);
  }

  return {
    getState,
    isEnabled,
    getPendingRequestCount,
    enterRunning,
    enterStopping,
    enterStopped,
    beginPendingWork,
    settlePendingWork,
  };
}
