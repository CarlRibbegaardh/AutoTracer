import type { NetworkTracerState } from "./NetworkTracerState.js";

/**
 * Resolves the lifecycle state after a start command.
 *
 * @param currentState - Current NetworkTracer lifecycle state.
 * @returns The lifecycle state after starting or resuming.
 */
export function getStartTransition(
  currentState: NetworkTracerState,
): NetworkTracerState {
  return currentState === "running" ? currentState : "running";
}
