import { describe, expect, it, vi } from "vitest";
import { createTerminalOutcomeGate } from "../../../src/outcomes/createTerminalOutcomeGate";
import { createXhrInstanceStateStore } from "../../../src/transport/createXhrInstanceStateStore";
import { createXhrOpenMetadata } from "../../../src/transport/createXhrOpenMetadata";

describe("createXhrInstanceStateStore", () => {
  it("[NET-XHR-002] keeps the latest open metadata for the next send", () => {
    const store = createXhrInstanceStateStore();
    const first = createXhrOpenMetadata({
      method: "GET",
      requestedUrl: "/api/first",
    });
    const second = createXhrOpenMetadata({
      method: "POST",
      requestedUrl: "/api/second",
      async: false,
    });

    expect(store.getOpenMetadata()).toBeUndefined();
    store.setOpenMetadata(first);
    store.setOpenMetadata(second);

    expect(store.getOpenMetadata()).toBe(second);
  });

  it("[NET-XHR-003,005] stores and clears the active request independently of open metadata", () => {
    const store = createXhrInstanceStateStore();
    const openMetadata = createXhrOpenMetadata({
      method: "GET",
      requestedUrl: "/api/orders",
    });
    const activeRequest = {
      requestId: 31,
      method: "GET",
      requestedUrl: "/api/orders",
      startMarker: 100,
      claimTerminalOutcome: createTerminalOutcomeGate(),
      settlePendingWork: vi.fn(),
      removeTerminalListeners: vi.fn(),
    } as const;

    store.setOpenMetadata(openMetadata);
    store.setActiveRequest(activeRequest);

    expect(store.getActiveRequest()).toBe(activeRequest);
    store.clearActiveRequest();
    expect(store.getActiveRequest()).toBeUndefined();
    expect(store.getOpenMetadata()).toBe(openMetadata);
  });
});
