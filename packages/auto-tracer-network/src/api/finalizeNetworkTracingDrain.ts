import type { NetworkTracerStateStore } from "../state/NetworkTracerStateStore.js";
import { shouldFinalizeDrain } from "../state/shouldFinalizeDrain.js";

/**
 * Finalizes a settled drain and emits its caller-selected final marker.
 *
 * @param stateStore - Current lifecycle state and stopped transition operation.
 * @param emitFinalMarker - Emits the final marker selected when the drain began.
 */
export function finalizeNetworkTracingDrain(
  stateStore: Pick<
    NetworkTracerStateStore,
    "getState" | "getPendingRequestCount" | "enterStopped"
  >,
  emitFinalMarker: () => void,
): void {
  if (
    !shouldFinalizeDrain(
      stateStore.getState(),
      stateStore.getPendingRequestCount(),
    )
  ) {
    return;
  }

  stateStore.enterStopped();
  emitFinalMarker();
}
