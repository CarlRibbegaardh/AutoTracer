import { createAutomaticTracingStoppedEvent } from "../events/createAutomaticTracingStoppedEvent.js";
import type { createNetworkTracingDrainStore } from "../state/createNetworkTracingDrainStore.js";
import type { NetworkTracerStateStore } from "../state/NetworkTracerStateStore.js";

/**
 * Selects the automatic final marker and enters draining state.
 *
 * @param requestLimit - Included-request limit that triggered the drain.
 * @param stateStore - Lifecycle transition operation.
 * @param drainStore - Final-event selection operation.
 */
export function beginAutomaticNetworkTracingDrain(
  requestLimit: number,
  stateStore: Pick<NetworkTracerStateStore, "enterStopping">,
  drainStore: Pick<
    ReturnType<typeof createNetworkTracingDrainStore>,
    "setFinalEvent"
  >,
): void {
  drainStore.setFinalEvent(createAutomaticTracingStoppedEvent(requestLimit));
  stateStore.enterStopping();
}
