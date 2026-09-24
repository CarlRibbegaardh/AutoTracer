import type { NetworkTracerState } from "./NetworkTracerState.js";

/**
 * Exposes internal NetworkTracer lifecycle state and pending-work operations.
 */
export interface NetworkTracerStateStore {
  /** Returns the current lifecycle state. */
  readonly getState: () => NetworkTracerState;

  /** Returns whether the runtime accepts new requests. */
  readonly isEnabled: () => boolean;

  /** Returns the number of work items that may still emit output. */
  readonly getPendingRequestCount: () => number;

  /** Enters the running state. */
  readonly enterRunning: () => void;

  /** Enters the stopping state. */
  readonly enterStopping: () => void;

  /** Enters the stopped state. */
  readonly enterStopped: () => void;

  /** Adds one pending request or detail work item. */
  readonly beginPendingWork: () => void;

  /** Settles one pending request or detail work item. */
  readonly settlePendingWork: () => void;
}
