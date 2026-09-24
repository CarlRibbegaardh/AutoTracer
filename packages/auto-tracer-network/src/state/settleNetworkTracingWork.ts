import { finalizeNetworkTracingDrain } from "../api/finalizeNetworkTracingDrain.js";
import type { createNetworkTracingDrainStore } from "./createNetworkTracingDrainStore.js";
import type { NetworkTracerStateStore } from "./NetworkTracerStateStore.js";

/**
 * Settles one work item and finalizes its selected drain at zero pending work.
 *
 * @param stateStore - Pending-work and lifecycle operations.
 * @param drainStore - Final event selected for the active drain.
 * @param emit - Runtime-control event sink.
 */
export function settleNetworkTracingWork(
  stateStore: Pick<
    NetworkTracerStateStore,
    "settlePendingWork" | "getState" | "getPendingRequestCount" | "enterStopped"
  >,
  drainStore: ReturnType<typeof createNetworkTracingDrainStore>,
  emit: (
    event: Exclude<ReturnType<typeof drainStore.getFinalEvent>, undefined>,
  ) => void,
): void {
  stateStore.settlePendingWork();
  const finalEvent = drainStore.getFinalEvent();
  if (finalEvent === undefined) return;
  const selectedFinalEvent: Exclude<typeof finalEvent, undefined> = finalEvent;

  /** Clears and emits the selected event without leaking sink failure. */
  function emitFinalEvent(): void {
    drainStore.clearFinalEvent();
    try {
      emit(selectedFinalEvent);
    } catch {}
  }

  finalizeNetworkTracingDrain(stateStore, emitFinalEvent);
}
