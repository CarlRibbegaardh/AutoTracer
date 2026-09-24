import { describe, expect, it } from "vitest";
import { startResponseHeadersCapture } from "../../../src/capture/startResponseHeadersCapture";

describe("startResponseHeadersCapture", () => {
  it("[NET-EVENT-009][NET-CAPTURE-005][NET-REDACT-001..003] emits a pending redacted response-header detail", () => {
    const order: string[] = [];
    const response = new Response(null, {
      headers: {
        "Set-Session-Token": "secret",
        "X-Visible": "yes",
      },
    });

    startResponseHeadersCapture(13, response, {
      redactionPatterns: ["*token*"],
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
      'emit:{"set-session-token":"[REDACTED]","x-visible":"yes"}',
      "settle",
    ]);
  });
});
