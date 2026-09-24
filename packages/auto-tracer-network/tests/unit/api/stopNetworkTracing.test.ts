import { describe, expect, it, vi } from "vitest";
import { stopNetworkTracing } from "../../../src/api/stopNetworkTracing";
import { createTracingStoppedEvent } from "../../../src/events/createTracingStoppedEvent";
import { createTracingStoppingEvent } from "../../../src/events/createTracingStoppingEvent";
import { createNetworkTracerStateStore } from "../../../src/state/createNetworkTracerStateStore";

describe("stopNetworkTracing", () => {
  it("[NET-STOP-002..003] stops immediately without settling native work when waiting is disabled", () => {
    const stateStore = createNetworkTracerStateStore(true);
    const emit = vi.fn();
    stateStore.beginPendingWork();

    stopNetworkTracing(stateStore, () => false, emit);

    expect(stateStore.getState()).toBe("stopped");
    expect(stateStore.getPendingRequestCount()).toBe(1);
    expect(emit).toHaveBeenCalledExactlyOnceWith(createTracingStoppedEvent());
  });

  it("[NET-STOP-004..005] starts a drain with the current pending-work count", () => {
    const stateStore = createNetworkTracerStateStore(true);
    const emit = vi.fn();
    stateStore.beginPendingWork();
    stateStore.beginPendingWork();

    stopNetworkTracing(stateStore, () => true, emit);

    expect(stateStore.getState()).toBe("stopping");
    expect(stateStore.getPendingRequestCount()).toBe(2);
    expect(emit).toHaveBeenCalledExactlyOnceWith(
      createTracingStoppingEvent(2),
    );
  });

  it("[NET-STATE-008..009] silently ignores duplicate stop commands", () => {
    const stateStore = createNetworkTracerStateStore(true);
    const emit = vi.fn();

    stopNetworkTracing(stateStore, () => true, emit);
    stopNetworkTracing(stateStore, () => false, emit);

    expect(stateStore.getState()).toBe("stopping");
    expect(emit).toHaveBeenCalledOnce();

    stateStore.enterStopped();
    stopNetworkTracing(stateStore, () => false, emit);

    expect(stateStore.getState()).toBe("stopped");
    expect(emit).toHaveBeenCalledOnce();
  });
});
