import { describe, expect, it } from "vitest";
import { createNetworkTracerStateStore } from "../../../src/state/createNetworkTracerStateStore";

describe("createNetworkTracerStateStore", () => {
  it("[NET-STATE-001] initializes stopped when enabled-on-load is false", () => {
    const store = createNetworkTracerStateStore(false);

    expect(store.getState()).toBe("stopped");
    expect(store.isEnabled()).toBe(false);
  });

  it("[NET-STATE-001] initializes running when enabled-on-load is true", () => {
    const store = createNetworkTracerStateStore(true);

    expect(store.getState()).toBe("running");
    expect(store.isEnabled()).toBe(true);
  });

  it("[NET-STATE-002][NET-STATE-003][NET-STATE-004] enables admission only while running", () => {
    const store = createNetworkTracerStateStore(false);

    store.enterRunning();
    expect(store.getState()).toBe("running");
    expect(store.isEnabled()).toBe(true);

    store.enterStopping();
    expect(store.getState()).toBe("stopping");
    expect(store.isEnabled()).toBe(false);

    store.enterStopped();
    expect(store.getState()).toBe("stopped");
    expect(store.isEnabled()).toBe(false);
  });

  it("[NET-STATE-005] reports request and detail work that may still emit", () => {
    const store = createNetworkTracerStateStore(true);

    expect(store.getPendingRequestCount()).toBe(0);
    store.beginPendingWork();
    store.beginPendingWork();
    expect(store.getPendingRequestCount()).toBe(2);
    store.settlePendingWork();
    expect(store.getPendingRequestCount()).toBe(1);
    store.settlePendingWork();
    expect(store.getPendingRequestCount()).toBe(0);
  });
});
