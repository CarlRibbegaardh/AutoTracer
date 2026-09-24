import { describe, expect, it, vi } from "vitest";
import { createNetworkTracingCommands } from "../../../src/api/createNetworkTracingCommands";
import { createAutomaticTracingStoppedEvent } from "../../../src/events/createAutomaticTracingStoppedEvent";
import { createTracingStartedEvent } from "../../../src/events/createTracingStartedEvent";
import { createTracingStoppedEvent } from "../../../src/events/createTracingStoppedEvent";
import { createTracingStoppingEvent } from "../../../src/events/createTracingStoppingEvent";
import { createIncludedRequestCountStore } from "../../../src/identity/createIncludedRequestCountStore";
import { createRequestIdStore } from "../../../src/identity/createRequestIdStore";
import { createNetworkTracerStateStore } from "../../../src/state/createNetworkTracerStateStore";
import { createNetworkTracingDrainStore } from "../../../src/state/createNetworkTracingDrainStore";

describe("createNetworkTracingCommands", () => {
  it("[NET-STOP-004..007] completes a manual drain and cancels its marker on resume", () => {
    const stateStore = createNetworkTracerStateStore(true);
    const drainStore = createNetworkTracingDrainStore();
    const emit = vi.fn();
    const commands = createNetworkTracingCommands({
      stateStore,
      drainStore,
      requestIds: createRequestIdStore(),
      admittedRequests: createIncludedRequestCountStore(),
      getWaitForPendingRequests: () => true,
      emit,
    });
    stateStore.beginPendingWork();

    commands.stop();

    expect(stateStore.getState()).toBe("stopping");
    expect(emit).toHaveBeenLastCalledWith(createTracingStoppingEvent(1));

    commands.start();
    commands.settlePendingWork();

    expect(stateStore.getState()).toBe("running");
    expect(drainStore.getFinalEvent()).toBeUndefined();
    expect(emit).toHaveBeenLastCalledWith(createTracingStartedEvent());

    stateStore.beginPendingWork();
    commands.stop();
    commands.settlePendingWork();

    expect(stateStore.getState()).toBe("stopped");
    expect(emit).toHaveBeenLastCalledWith(createTracingStoppedEvent());
  });

  it("[NET-STOP-008..010][NET-AUTOSTOP-004..007] coordinates forced and automatic drain endings", () => {
    const stateStore = createNetworkTracerStateStore(true);
    const drainStore = createNetworkTracingDrainStore();
    const emit = vi.fn();
    const commands = createNetworkTracingCommands({
      stateStore,
      drainStore,
      requestIds: createRequestIdStore(),
      admittedRequests: createIncludedRequestCountStore(),
      getWaitForPendingRequests: () => true,
      emit,
    });
    stateStore.beginPendingWork();

    commands.enterAutomaticStopping(4);
    commands.forceStop();
    commands.settlePendingWork();

    expect(stateStore.getState()).toBe("stopped");
    expect(drainStore.getFinalEvent()).toBeUndefined();
    expect(emit).toHaveBeenCalledExactlyOnceWith(createTracingStoppedEvent());

    commands.start();
    stateStore.beginPendingWork();
    commands.enterAutomaticStopping(6);
    commands.settlePendingWork();

    expect(stateStore.getState()).toBe("stopped");
    expect(emit).toHaveBeenLastCalledWith(
      createAutomaticTracingStoppedEvent(6),
    );
  });
});
