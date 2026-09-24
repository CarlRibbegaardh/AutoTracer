import { describe, expect, it } from "vitest";
import { startXhrResponseBodyCapture } from "../../../src/capture/startXhrResponseBodyCapture";

describe("startXhrResponseBodyCapture", () => {
  it("[NET-CAPTURE-008,012][NET-BODY-015..016] captures XHR response data as independent pending work", () => {
    const order: string[] = [];
    const xhr = {
      get response(): unknown {
        order.push("read");
        throw new TypeError("cannot read");
      },
      getResponseHeader: () => "text/plain",
    };

    startXhrResponseBodyCapture(39, xhr, {
      bodyCaptureLimit: 64,
      redactionPatterns: [],
      beginPendingWork: () => {
        order.push("begin");
      },
      canEmitPendingOutput: () => true,
      emit: (event) => {
        order.push(`emit:${event.tokens[2]?.text}`);
      },
      settlePendingWork: () => {
        order.push("settle");
      },
    });

    expect(order).toEqual(["begin", "read", "emit:response body", "settle"]);
  });
});
