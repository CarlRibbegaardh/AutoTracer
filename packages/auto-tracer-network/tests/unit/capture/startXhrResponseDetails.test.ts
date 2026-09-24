import { describe, expect, it, vi } from "vitest";
import { startXhrResponseDetails } from "../../../src/capture/startXhrResponseDetails";

describe("startXhrResponseDetails", () => {
  it("[NET-CAPTURE-001,005..006,008][NET-BODY-005] emits enabled XHR response headers before the body", () => {
    const labels: string[] = [];
    const beginPendingWork = vi.fn();
    const settlePendingWork = vi.fn();

    startXhrResponseDetails(
      40,
      {
        response: "response text",
        getAllResponseHeaders: () => "Content-Type: text/plain\r\n",
        getResponseHeader: () => "text/plain",
      },
      {
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
        emit: (
          event: Parameters<
            Parameters<typeof startXhrResponseDetails>[2]["emit"]
          >[0],
        ) => {
          labels.push(event.tokens[2]?.text ?? "missing");
        },
        settlePendingWork,
      },
    );

    expect(labels).toEqual(["response headers", "response body"]);
    expect(beginPendingWork).toHaveBeenCalledTimes(2);
    expect(settlePendingWork).toHaveBeenCalledTimes(2);
  });

  it("[NET-CAPTURE-001] performs no detail work when XHR response capture is disabled", () => {
    const getAllResponseHeaders = vi.fn();
    const getResponseHeader = vi.fn();
    const beginPendingWork = vi.fn();
    const emit = vi.fn();

    startXhrResponseDetails(
      41,
      {
        response: "response text",
        getAllResponseHeaders,
        getResponseHeader,
      },
      {
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
      },
    );

    expect(getAllResponseHeaders).not.toHaveBeenCalled();
    expect(getResponseHeader).not.toHaveBeenCalled();
    expect(beginPendingWork).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });
});
