import type { NetworkTracerState } from "./NetworkTracerState.js";

/**
 * Resolves the lifecycle state after a force-stop command.
 *
 * @param currentState - Current NetworkTracer lifecycle state.
 * @returns The stopped lifecycle state.
 */
export function getForceStopTransition(
  currentState: NetworkTracerState,
): NetworkTracerState {
  return currentState === "stopped" ? currentState : "stopped";
}
