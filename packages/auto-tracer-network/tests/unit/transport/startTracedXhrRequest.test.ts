import { describe, expect, it, vi } from "vitest";
import { createRequestStartEvent } from "../../../src/events/createRequestStartEvent";
import { startTracedXhrRequest } from "../../../src/transport/startTracedXhrRequest";

describe("startTracedXhrRequest", () => {
  it("[NET-EVENT-001,005][NET-ID-008][NET-XHR-003..005] starts one admitted XHR lifecycle", () => {
    const order: string[] = [];
    const addedListeners: string[] = [];
    const removeEventListener = vi.fn();
    const settlePendingWork = vi.fn();
    const activeRequest = startTracedXhrRequest(
      {
        status: 0,
        responseURL: "",
        addEventListener: (eventType: string) => {
          order.push("listen");
          addedListeners.push(eventType);
        },
        removeEventListener,
      },
      {
        requestId: 30,
        method: "POST",
        requestedUrl: "/api/orders",
        normalizedRequestedUrl: "https://example.test/api/orders",
        startMarker: 100,
        getCompletionMarker: () => 125,
        beginPendingWork: () => {
          order.push("begin");
        },
        canEmitPendingOutput: () => true,
        settlePendingWork,
        emit: (event) => {
          order.push("emit");
          expect(event).toEqual(
            createRequestStartEvent(30, "POST", "/api/orders"),
          );
        },
      },
    );

    expect(order).toEqual([
      "begin",
      "emit",
      "listen",
      "listen",
      "listen",
      "listen",
    ]);
    expect(addedListeners).toEqual(["load", "error", "abort", "timeout"]);
    expect(activeRequest).toEqual({
      requestId: 30,
      method: "POST",
      requestedUrl: "/api/orders",
      startMarker: 100,
      claimTerminalOutcome: expect.any(Function),
      settlePendingWork,
      removeTerminalListeners: expect.any(Function),
    });

    activeRequest.removeTerminalListeners();
    expect(removeEventListener).toHaveBeenCalledTimes(4);
  });
});
