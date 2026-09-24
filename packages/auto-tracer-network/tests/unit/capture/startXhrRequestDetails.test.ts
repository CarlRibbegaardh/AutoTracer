import { describe, expect, it, vi } from "vitest";
import { createRequestHeadersDetailEvent } from "../../../src/capture/createRequestHeadersDetailEvent";
import { createXhrRequestBodyDetailEvent } from "../../../src/capture/createXhrRequestBodyDetailEvent";
import { startXhrRequestDetails } from "../../../src/capture/startXhrRequestDetails";

describe("startXhrRequestDetails", () => {
  it("[NET-CAPTURE-004,006,009][NET-BODY-004] emits enabled headers before the XHR body", () => {
    const headers = new Headers({
      "Content-Type": "application/json",
      "X-Client": "web",
    });
    const body = '{"accessToken":"secret","visible":true}';
    const emitted: unknown[] = [];
    const beginPendingWork = vi.fn();
    const settlePendingWork = vi.fn();

    startXhrRequestDetails(
      23,
      { headers, body },
      {
        capture: {
          captureRequestHeaders: true,
          captureRequestBody: true,
          captureResponseHeaders: false,
          captureResponseBody: false,
          bodyCaptureLimit: 64,
          redactionPatterns: ["*token*"],
        },
        beginPendingWork,
        canEmitPendingOutput: () => true,
        emit: (event) => {
          emitted.push(event);
        },
        settlePendingWork,
      },
    );

    expect(beginPendingWork).toHaveBeenCalledTimes(2);
    expect(settlePendingWork).toHaveBeenCalledTimes(2);
    expect(emitted).toEqual([
      createRequestHeadersDetailEvent(23, headers, ["*token*"]),
      createXhrRequestBodyDetailEvent(23, body, {
        contentType: "application/json",
        bodyCaptureLimit: 64,
        redactionPatterns: ["*token*"],
      }),
    ]);
  });

  it("[NET-CAPTURE-001] performs no detail work when XHR request capture is disabled", () => {
    const beginPendingWork = vi.fn();
    const emit = vi.fn();

    startXhrRequestDetails(
      24,
      { headers: new Headers(), body: "payload" },
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
        emit,
        settlePendingWork: vi.fn(),
      },
    );

    expect(beginPendingWork).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it("[NET-BODY-003] skips an absent XHR request body", () => {
    const beginPendingWork = vi.fn();
    const emit = vi.fn();

    startXhrRequestDetails(
      25,
      { headers: new Headers(), body: null },
      {
        capture: {
          captureRequestHeaders: false,
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

    expect(beginPendingWork).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });
});
