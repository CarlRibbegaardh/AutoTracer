import { describe, expect, it, vi } from "vitest";
import { forceStopNetworkTracing } from "../../../src/api/forceStopNetworkTracing";
import { createTracingStoppedEvent } from "../../../src/events/createTracingStoppedEvent";
import { createNetworkTracerStateStore } from "../../../src/state/createNetworkTracerStateStore";

describe("forceStopNetworkTracing", () => {
  it("[NET-STOP-008..009] immediately stops a drain without settling native work", () => {
    const stateStore = createNetworkTracerStateStore(true);
    const emit = vi.fn();
    stateStore.beginPendingWork();
    stateStore.enterStopping();

    forceStopNetworkTracing(stateStore, emit);

    expect(stateStore.getState()).toBe("stopped");
    expect(stateStore.getPendingRequestCount()).toBe(1);
    expect(emit).toHaveBeenCalledExactlyOnceWith(createTracingStoppedEvent());
  });

  it("[NET-STOP-008] immediately stops a running session", () => {
    const stateStore = createNetworkTracerStateStore(true);
    const emit = vi.fn();

    forceStopNetworkTracing(stateStore, emit);

    expect(stateStore.getState()).toBe("stopped");
    expect(emit).toHaveBeenCalledExactlyOnceWith(createTracingStoppedEvent());
  });

  it("[NET-STATE-010] silently ignores force stop while already stopped", () => {
    const stateStore = createNetworkTracerStateStore(false);
    const emit = vi.fn();

    forceStopNetworkTracing(stateStore, emit);

    expect(stateStore.getState()).toBe("stopped");
    expect(emit).not.toHaveBeenCalled();
  });
});
