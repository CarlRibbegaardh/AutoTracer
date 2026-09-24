import { createTracingStoppedEvent } from "../events/createTracingStoppedEvent.js";
import { createTracingStoppingEvent } from "../events/createTracingStoppingEvent.js";
import { getManualStopTransition } from "../state/getManualStopTransition.js";
import type { NetworkTracerStateStore } from "../state/NetworkTracerStateStore.js";

/**
 * Stops NetworkTracer according to the current manual-stop waiting policy.
 *
 * @param stateStore - Current lifecycle state and transition operations.
 * @param getWaitForPendingRequests - Returns the live manual-stop waiting policy.
 * @param emit - Runtime-control event sink.
 */
export function stopNetworkTracing(
  stateStore: Pick<
    NetworkTracerStateStore,
    | "getState"
    | "getPendingRequestCount"
    | "enterStopping"
    | "enterStopped"
  >,
  getWaitForPendingRequests: () => boolean,
  emit: (
    event:
      | ReturnType<typeof createTracingStoppedEvent>
      | ReturnType<typeof createTracingStoppingEvent>
  ) => void,
): void {
  const currentState = stateStore.getState();
  const nextState = getManualStopTransition(
    currentState,
    getWaitForPendingRequests(),
  );
  if (nextState === currentState) return;

  if (nextState === "stopping") {
    stateStore.enterStopping();
    emit(createTracingStoppingEvent(stateStore.getPendingRequestCount()));
    return;
  }

  stateStore.enterStopped();
  emit(createTracingStoppedEvent());
}
