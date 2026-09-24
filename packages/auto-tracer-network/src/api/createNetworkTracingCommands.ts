import { beginAutomaticNetworkTracingDrain } from "../automatic-stop/beginAutomaticNetworkTracingDrain.js";
import type { createAutomaticTracingStoppedEvent } from "../events/createAutomaticTracingStoppedEvent.js";
import type { createTracingStartedEvent } from "../events/createTracingStartedEvent.js";
import { createTracingStoppedEvent } from "../events/createTracingStoppedEvent.js";
import type { createTracingStoppingEvent } from "../events/createTracingStoppingEvent.js";
import type { IncludedRequestCountStore } from "../identity/IncludedRequestCountStore.js";
import type { RequestIdStore } from "../identity/RequestIdStore.js";
import type { createNetworkTracingDrainStore } from "../state/createNetworkTracingDrainStore.js";
import type { NetworkTracerStateStore } from "../state/NetworkTracerStateStore.js";
import { settleNetworkTracingWork } from "../state/settleNetworkTracingWork.js";
import { forceStopNetworkTracing } from "./forceStopNetworkTracing.js";
import { startNetworkTracing } from "./startNetworkTracing.js";
import { stopNetworkTracing } from "./stopNetworkTracing.js";

/**
 * Creates coordinated NetworkTracer lifecycle and pending-work commands.
 *
 * @param dependencies - Lifecycle stores, live stop policy, and event sink.
 * @returns Commands shared by the public API and transport runtime.
 */
export function createNetworkTracingCommands(
  dependencies: Readonly<{
    stateStore: NetworkTracerStateStore;
    drainStore: ReturnType<typeof createNetworkTracingDrainStore>;
    requestIds: RequestIdStore;
    admittedRequests: IncludedRequestCountStore;
    getWaitForPendingRequests: () => boolean;
    emit: (
      event:
        | ReturnType<typeof createTracingStartedEvent>
        | ReturnType<typeof createTracingStoppingEvent>
        | ReturnType<typeof createTracingStoppedEvent>
        | ReturnType<typeof createAutomaticTracingStoppedEvent>,
    ) => void;
  }>,
): Readonly<{
  start: () => void;
  stop: () => void;
  forceStop: () => void;
  enterAutomaticStopping: (requestLimit: number) => void;
  settlePendingWork: () => void;
}> {
  /** Starts or resumes tracing without retaining an obsolete final marker. */
  function start(): void {
    dependencies.drainStore.clearFinalEvent();
    startNetworkTracing(
      dependencies.stateStore,
      { ...dependencies.requestIds, ...dependencies.admittedRequests },
      (event) => {return dependencies.emit(event)},
    );
  }

  /** Applies the live manual-stop policy and selects its drain marker. */
  function stop(): void {
    if (dependencies.stateStore.getState() !== "running") return;

    const waitsForPendingRequests = dependencies.getWaitForPendingRequests();
    if (waitsForPendingRequests) {
      dependencies.drainStore.setFinalEvent(createTracingStoppedEvent());
    } else {
      dependencies.drainStore.clearFinalEvent();
    }

    stopNetworkTracing(
      dependencies.stateStore,
      () => {return waitsForPendingRequests},
      (event) => {return dependencies.emit(event)},
    );

    if (waitsForPendingRequests) {
      settleCompletedDrain();
    }
  }

  /** Immediately stops tracing and discards any pending drain marker. */
  function forceStop(): void {
    if (dependencies.stateStore.getState() === "stopped") return;

    dependencies.drainStore.clearFinalEvent();
    forceStopNetworkTracing(dependencies.stateStore, (event) =>
      {return dependencies.emit(event)},
    );
  }

  /** Selects an automatic final marker and enters draining state. */
  function enterAutomaticStopping(requestLimit: number): void {
    beginAutomaticNetworkTracingDrain(
      requestLimit,
      dependencies.stateStore,
      dependencies.drainStore,
    );
  }

  /** Settles one pending work item and completes its active drain. */
  function settlePendingWork(): void {
    settleNetworkTracingWork(
      dependencies.stateStore,
      dependencies.drainStore,
      (event) => {return dependencies.emit(event)},
    );
  }

  /** Finalizes a zero-work drain without decrementing its pending count. */
  function settleCompletedDrain(): void {
    if (dependencies.stateStore.getPendingRequestCount() !== 0) return;

    dependencies.stateStore.beginPendingWork();
    settlePendingWork();
  }

  return {
    start,
    stop,
    forceStop,
    enterAutomaticStopping,
    settlePendingWork,
  };
}
