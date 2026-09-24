import { describe, expect, it, vi } from "vitest";
import { createNetworkTracerConfigStore } from "../../../src/configuration/createNetworkTracerConfigStore";
import { createIncludedRequestCountStore } from "../../../src/identity/createIncludedRequestCountStore";
import { createRequestIdStore } from "../../../src/identity/createRequestIdStore";
import { createNetworkTransportRuntime } from "../../../src/runtime/createNetworkTransportRuntime";
import { createNetworkTracerStateStore } from "../../../src/state/createNetworkTracerStateStore";

describe("createNetworkTransportRuntime", () => {
  it("[NET-STATE-003..005][NET-ID-001,007..008] composes live transport dependencies", () => {
    const stateStore = createNetworkTracerStateStore(true);
    const configStore = createNetworkTracerConfigStore(
      {
        getItem: () => null,
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      {},
    );
    const requestIds = createRequestIdStore();
    const admittedRequests = createIncludedRequestCountStore();
    const enterAutomaticStopping = vi.fn();
    const settlePendingWork = vi.fn();
    const getMonotonicMarker = vi.fn(() => 42);
    const emit = vi.fn();
    const runtime = createNetworkTransportRuntime({
      stateStore,
      configStore,
      requestIds,
      admittedRequests,
      commands: { enterAutomaticStopping, settlePendingWork },
      baseUrl: "https://example.test/app/",
      getMonotonicMarker,
      emit,
    });

    expect(runtime.baseUrl).toBe("https://example.test/app/");
    expect(runtime.isEnabled()).toBe(true);
    expect(runtime.canEmitPendingOutput()).toBe(true);
    expect(runtime.getConfig()).toEqual(configStore.getConfig());
    expect(runtime.getNextRequestId()).toBe(1);
    runtime.setAdmittedRequestCount(3);
    expect(runtime.getAdmittedRequestCount()).toBe(3);
    runtime.beginPendingWork();
    expect(stateStore.getPendingRequestCount()).toBe(1);
    runtime.enterStopping(3);
    runtime.settlePendingWork();
    runtime.emit({ tokens: [] });

    expect(enterAutomaticStopping).toHaveBeenCalledExactlyOnceWith(3);
    expect(settlePendingWork).toHaveBeenCalledOnce();
    expect(getMonotonicMarker()).toBe(42);
    expect(emit).toHaveBeenCalledExactlyOnceWith({ tokens: [] });

    stateStore.enterStopped();
    expect(runtime.isEnabled()).toBe(false);
    expect(runtime.canEmitPendingOutput()).toBe(false);
  });
});
