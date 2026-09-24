import { describe, expect, it } from "vitest";
import { startRequestHeadersCapture } from "../../../src/capture/startRequestHeadersCapture";

describe("startRequestHeadersCapture", () => {
  it("[NET-EVENT-009][NET-CAPTURE-004][NET-REDACT-001..003] emits a pending redacted request-header detail", () => {
    const order: string[] = [];
    const headers = new Headers({
      Authorization: "secret",
      "X-Client": "web",
    });

    startRequestHeadersCapture(12, headers, {
      redactionPatterns: ["authorization"],
      beginPendingWork: () => {
        order.push("begin");
      },
      canEmitPendingOutput: () => true,
      emit: (event) => {
        order.push(`emit:${JSON.stringify(event.value)}`);
      },
      settlePendingWork: () => {
        order.push("settle");
      },
    });

    expect(order).toEqual([
      "begin",
      'emit:{"authorization":"[REDACTED]","x-client":"web"}',
      "settle",
    ]);
  });
});
