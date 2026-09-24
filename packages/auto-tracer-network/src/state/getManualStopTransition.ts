import type { NetworkTracerState } from "./NetworkTracerState.js";

/**
 * Resolves the lifecycle state after a manual stop command.
 *
 * @param currentState - Current NetworkTracer lifecycle state.
 * @param waitForPendingRequests - Whether pending logging work should drain.
 * @returns The lifecycle state after applying manual-stop policy.
 */
export function getManualStopTransition(
  currentState: NetworkTracerState,
  waitForPendingRequests: boolean,
): NetworkTracerState {
  if (currentState !== "running") {
    return currentState;
  }

  return waitForPendingRequests ? "stopping" : "stopped";
}
