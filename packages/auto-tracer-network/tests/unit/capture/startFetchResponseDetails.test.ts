import { describe, expect, it, vi } from "vitest";
import { startFetchResponseDetails } from "../../../src/capture/startFetchResponseDetails";

describe("startFetchResponseDetails", () => {
  it("[NET-CAPTURE-005..007,012][NET-BODY-015] emits enabled headers and starts body capture", async () => {
    const labels: string[] = [];
    const settlePendingWork = vi.fn();

    startFetchResponseDetails(
      15,
      new Response("response body", {
        headers: { "X-Visible": "yes" },
      }),
      {
        capture: {
          captureRequestHeaders: false,
          captureRequestBody: false,
          captureResponseHeaders: true,
          captureResponseBody: true,
          bodyCaptureLimit: 64,
          redactionPatterns: [],
        },
        beginPendingWork: vi.fn(),
        canEmitPendingOutput: () => true,
        emit: (event) => {
          labels.push(event.tokens[2]?.text ?? "missing");
        },
        settlePendingWork,
      },
    );

    expect(labels).toEqual(["response headers"]);
    await vi.waitFor(() => {
      expect(labels).toEqual(["response headers", "response body"]);
    });
    expect(settlePendingWork).toHaveBeenCalledTimes(2);
  });

  it("[NET-CAPTURE-001] performs no detail work when response capture is disabled", () => {
    const beginPendingWork = vi.fn();
    const emit = vi.fn();

    startFetchResponseDetails(16, new Response("response body"), {
      capture: {
        captureRequestHeaders: true,
        captureRequestBody: true,
        captureResponseHeaders: false,
        captureResponseBody: false,
        bodyCaptureLimit: 64,
        redactionPatterns: [],
      },
      beginPendingWork,
      canEmitPendingOutput: () => true,
      emit,
      settlePendingWork: vi.fn(),
    });

    expect(beginPendingWork).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });
});
