import type { NetworkTracerState } from "./NetworkTracerState.js";

/**
 * Determines whether a draining session has settled all logging work.
 *
 * @param state - Current NetworkTracer lifecycle state.
 * @param pendingRequestCount - Logging work that may still emit.
 * @returns `true` when a stopping session can finalize.
 */
export function shouldFinalizeDrain(
  state: NetworkTracerState,
  pendingRequestCount: number,
): boolean {
  return state === "stopping" && pendingRequestCount === 0;
}
