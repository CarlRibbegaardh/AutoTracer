import { describe, expect, it, vi } from "vitest";
import { startFetchRequestDetails } from "../../../src/capture/startFetchRequestDetails";

describe("startFetchRequestDetails", () => {
  it("[NET-CAPTURE-004,006,009..011] emits enabled headers before starting body capture", () => {
    const labels: string[] = [];

    startFetchRequestDetails(
      12,
      { input: "/api/orders", init: { method: "POST", body: "payload" } },
      {
        metadata: {
          method: "POST",
          requestedUrl: "/api/orders",
          headers: new Headers({ "X-Client": "web" }),
          contentType: null,
        },
        capture: {
          captureRequestHeaders: true,
          captureRequestBody: true,
          captureResponseHeaders: false,
          captureResponseBody: false,
          bodyCaptureLimit: 64,
          redactionPatterns: [],
        },
        beginPendingWork: vi.fn(),
        canEmitPendingOutput: () => true,
        emit: (event) => {
          labels.push(event.tokens[2]?.text ?? "missing");
        },
        settlePendingWork: vi.fn(),
      },
    );

    expect(labels).toEqual(["request headers", "request body"]);
  });

  it("[NET-CAPTURE-001] performs no detail work when request capture is disabled", () => {
    const beginPendingWork = vi.fn();
    const emit = vi.fn();

    startFetchRequestDetails(
      13,
      { input: "/api/orders" },
      {
        metadata: {
          method: "GET",
          requestedUrl: "/api/orders",
          headers: new Headers(),
          contentType: null,
        },
        capture: {
          captureRequestHeaders: false,
          captureRequestBody: false,
          captureResponseHeaders: true,
          captureResponseBody: true,
          bodyCaptureLimit: 64,
          redactionPatterns: [],
        },
        beginPendingWork,
        canEmitPendingOutput: () => true,
        emit,
        settlePendingWork: vi.fn(),
      },
    );

    expect(beginPendingWork).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });
});
