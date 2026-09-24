import { createTracingStartedEvent } from "../events/createTracingStartedEvent.js";
import type { IncludedRequestCountStore } from "../identity/IncludedRequestCountStore.js";
import type { RequestIdStore } from "../identity/RequestIdStore.js";
import { getStartTransition } from "../state/getStartTransition.js";
import type { NetworkTracerStateStore } from "../state/NetworkTracerStateStore.js";

/**
 * Starts or resumes NetworkTracer when the lifecycle transition changes state.
 *
 * @param stateStore - Current lifecycle state and running transition operation.
 * @param session - Session identity and admission-count reset operations.
 * @param emit - Runtime-control event sink.
 */
export function startNetworkTracing(
  stateStore: Pick<NetworkTracerStateStore, "getState" | "enterRunning">,
  session: Pick<RequestIdStore, "resetRequestIds"> &
    Pick<IncludedRequestCountStore, "resetAdmittedRequestCount">,
  emit: (event: ReturnType<typeof createTracingStartedEvent>) => void,
): void {
  const currentState = stateStore.getState();
  const nextState = getStartTransition(currentState);
  if (nextState === currentState) return;

  if (currentState === "stopped") {
    session.resetRequestIds();
    session.resetAdmittedRequestCount();
  }

  stateStore.enterRunning();
  emit(createTracingStartedEvent());
}
