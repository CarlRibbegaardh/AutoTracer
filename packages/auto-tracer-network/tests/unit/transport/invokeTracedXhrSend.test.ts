import { describe, expect, it, vi } from "vitest";
import { createRequestStartEvent } from "../../../src/events/createRequestStartEvent";
import { invokeTracedXhrSend } from "../../../src/transport/invokeTracedXhrSend";

describe("invokeTracedXhrSend", () => {
  it("[NET-EVENT-001,005][NET-ID-008][NET-XHR-001,005][NET-NATIVE-002] stores an active lifecycle before native send", () => {
    const order: string[] = [];
    const emitted: unknown[] = [];
    const activeRequests: unknown[] = [];
    const body = new URLSearchParams({ title: "trace" });

    invokeTracedXhrSend(
      () => {
        order.push("native");
      },
      {
        xhr: {
          status: 0,
          responseURL: "",
          addEventListener: () => {
            order.push("listen");
          },
          removeEventListener: vi.fn(),
        },
        args: [body],
      },
      {
        requestId: 36,
        method: "POST",
        requestedUrl: "/api/orders",
        normalizedRequestedUrl: "https://example.test/api/orders",
        startMarker: 100,
        getCompletionMarker: () => 125,
        beginPendingWork: () => {
          order.push("begin");
        },
        canEmitPendingOutput: () => true,
        settlePendingWork: vi.fn(),
        emit: (event) => {
          order.push("emit");
          emitted.push(event);
        },
        setActiveRequest: (request) => {
          order.push("active");
          activeRequests.push(request);
        },
        startRequestDetails: () => {
          order.push("details");
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
      "active",
      "details",
      "native",
    ]);
    expect(emitted).toEqual([
      createRequestStartEvent(36, "POST", "/api/orders"),
    ]);
    expect(activeRequests).toHaveLength(1);
  });
});
