import type { NetworkTracerState } from "../state/NetworkTracerState.js";
import type { NetworkTracerConfigApi } from "./NetworkTracerConfigApi.js";

/**
 * Exposes NetworkTracer lifecycle, state, and configuration controls.
 */
export interface NetworkTracerApi extends NetworkTracerConfigApi {
  /** Starts or resumes network tracing. */
  readonly start: () => void;
  /** Stops network tracing according to the current manual-stop policy. */
  readonly stop: () => void;
  /** Immediately stops network tracing and suppresses unfinished output. */
  readonly forceStop: () => void;
  /** Returns whether new requests are accepted into the trace. */
  readonly isEnabled: () => boolean;
  /** Returns the current lifecycle state. */
  readonly getState: () => NetworkTracerState;
  /** Returns the number of work items that may still emit output. */
  readonly getPendingRequestCount: () => number;
}
