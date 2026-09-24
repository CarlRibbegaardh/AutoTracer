import { describe, expect, it, vi } from "vitest";
import { buildNetworkTracerApi } from "../../../src/api/buildNetworkTracerApi";
import { buildNetworkTracerConfigApi } from "../../../src/api/buildNetworkTracerConfigApi";
import { createNetworkTracerConfigStore } from "../../../src/configuration/createNetworkTracerConfigStore";
import { createNetworkTracerStateStore } from "../../../src/state/createNetworkTracerStateStore";

describe("buildNetworkTracerApi", () => {
  it("[NET-API-001..008] combines lifecycle, live state, and configuration controls", () => {
    const start = vi.fn();
    const stop = vi.fn();
    const forceStop = vi.fn();
    const stateStore = createNetworkTracerStateStore(false);
    const configApi = buildNetworkTracerConfigApi(
      createNetworkTracerConfigStore(
        {
          getItem: () => null,
          setItem: vi.fn(),
          removeItem: vi.fn(),
        },
        {},
      ),
    );
    const api = buildNetworkTracerApi(
      { start, stop, forceStop },
      stateStore,
      configApi,
    );

    api.start();
    api.stop();
    api.forceStop();

    expect(start).toHaveBeenCalledOnce();
    expect(stop).toHaveBeenCalledOnce();
    expect(forceStop).toHaveBeenCalledOnce();
    expect(api.isEnabled()).toBe(false);
    expect(api.getState()).toBe("stopped");
    expect(api.getPendingRequestCount()).toBe(0);

    stateStore.enterRunning();
    stateStore.beginPendingWork();
    api.setCaptureRequestHeaders(true);

    expect(api.isEnabled()).toBe(true);
    expect(api.getState()).toBe("running");
    expect(api.getPendingRequestCount()).toBe(1);
    expect(api.getCaptureRequestHeaders()).toBe(true);
  });
});
