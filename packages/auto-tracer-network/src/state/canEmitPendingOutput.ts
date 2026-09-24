import type { NetworkTracerState } from "./NetworkTracerState.js";

/**
 * Determines whether pending logging work may emit in a lifecycle state.
 *
 * @param state - Current NetworkTracer lifecycle state.
 * @returns `true` while running or draining.
 */
export function canEmitPendingOutput(state: NetworkTracerState): boolean {
  return state !== "stopped";
}
