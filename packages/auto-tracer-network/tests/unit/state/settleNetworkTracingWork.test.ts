import { describe, expect, it, vi } from "vitest";
import { createAutomaticTracingStoppedEvent } from "../../../src/events/createAutomaticTracingStoppedEvent";
import { createNetworkTracerStateStore } from "../../../src/state/createNetworkTracerStateStore";
import { createNetworkTracingDrainStore } from "../../../src/state/createNetworkTracingDrainStore";
import { settleNetworkTracingWork } from "../../../src/state/settleNetworkTracingWork";

describe("settleNetworkTracingWork", () => {
  it("[NET-STOP-006][NET-AUTOSTOP-005..007] finalizes the selected drain only after its last work item", () => {
    const stateStore = createNetworkTracerStateStore(true);
    const drainStore = createNetworkTracingDrainStore();
    const emit = vi.fn();
    const finalEvent = createAutomaticTracingStoppedEvent(2);
    stateStore.beginPendingWork();
    stateStore.beginPendingWork();
    stateStore.enterStopping();
    drainStore.setFinalEvent(finalEvent);

    settleNetworkTracingWork(stateStore, drainStore, emit);

    expect(stateStore.getPendingRequestCount()).toBe(1);
    expect(stateStore.getState()).toBe("stopping");
    expect(emit).not.toHaveBeenCalled();

    settleNetworkTracingWork(stateStore, drainStore, emit);

    expect(stateStore.getPendingRequestCount()).toBe(0);
    expect(stateStore.getState()).toBe("stopped");
    expect(emit).toHaveBeenCalledExactlyOnceWith(finalEvent);
    expect(drainStore.getFinalEvent()).toBeUndefined();
  });

  it("[NET-STOP-010] settles work without output outside a selected drain", () => {
    const stateStore = createNetworkTracerStateStore(true);
    const drainStore = createNetworkTracingDrainStore();
    const emit = vi.fn();
    stateStore.beginPendingWork();

    settleNetworkTracingWork(stateStore, drainStore, emit);

    expect(stateStore.getPendingRequestCount()).toBe(0);
    expect(stateStore.getState()).toBe("running");
    expect(emit).not.toHaveBeenCalled();
  });
});
