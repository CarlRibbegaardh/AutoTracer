import { describe, expect, it, vi } from "vitest";
import { createTracingStartedEvent } from "../../../src/events/createTracingStartedEvent";
import { createNetworkTracerStateStore } from "../../../src/state/createNetworkTracerStateStore";
import { startNetworkTracing } from "../../../src/api/startNetworkTracing";

describe("startNetworkTracing", () => {
  it("[NET-STATE-006][NET-ID-004,006] starts a clean session and resets session counters", () => {
    const stateStore = createNetworkTracerStateStore(false);
    const resetRequestIds = vi.fn();
    const resetAdmittedRequestCount = vi.fn();
    const emit = vi.fn();

    startNetworkTracing(
      stateStore,
      { resetRequestIds, resetAdmittedRequestCount },
      emit,
    );

    expect(stateStore.getState()).toBe("running");
    expect(resetRequestIds).toHaveBeenCalledOnce();
    expect(resetAdmittedRequestCount).toHaveBeenCalledOnce();
    expect(emit).toHaveBeenCalledExactlyOnceWith(createTracingStartedEvent());

    startNetworkTracing(
      stateStore,
      { resetRequestIds, resetAdmittedRequestCount },
      emit,
    );

    expect(resetRequestIds).toHaveBeenCalledOnce();
    expect(resetAdmittedRequestCount).toHaveBeenCalledOnce();
    expect(emit).toHaveBeenCalledOnce();
  });

  it("[NET-STATE-007,011][NET-ID-005] resumes a draining session without resetting counters", () => {
    const stateStore = createNetworkTracerStateStore(true);
    const resetRequestIds = vi.fn();
    const resetAdmittedRequestCount = vi.fn();
    const emit = vi.fn();
    stateStore.enterStopping();

    startNetworkTracing(
      stateStore,
      { resetRequestIds, resetAdmittedRequestCount },
      emit,
    );

    expect(stateStore.getState()).toBe("running");
    expect(resetRequestIds).not.toHaveBeenCalled();
    expect(resetAdmittedRequestCount).not.toHaveBeenCalled();
    expect(emit).toHaveBeenCalledExactlyOnceWith(createTracingStartedEvent());
  });
});
