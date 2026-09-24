import { createTracingStoppedEvent } from "../events/createTracingStoppedEvent.js";
import { getForceStopTransition } from "../state/getForceStopTransition.js";
import type { NetworkTracerStateStore } from "../state/NetworkTracerStateStore.js";

/**
 * Immediately stops NetworkTracer without settling pending native work.
 *
 * @param stateStore - Current lifecycle state and stopped transition operation.
 * @param emit - Runtime-control event sink.
 */
export function forceStopNetworkTracing(
  stateStore: Pick<NetworkTracerStateStore, "getState" | "enterStopped">,
  emit: (event: ReturnType<typeof createTracingStoppedEvent>) => void,
): void {
  const currentState = stateStore.getState();
  const nextState = getForceStopTransition(currentState);
  if (nextState === currentState) return;

  stateStore.enterStopped();
  emit(createTracingStoppedEvent());
}
