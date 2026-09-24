import { describe, expect, it } from "vitest";
import { startResponseBodyCapture } from "../../../src/capture/startResponseBodyCapture";

describe("startResponseBodyCapture", () => {
  it("[NET-ID-008][NET-BODY-003,015..016] emits unavailable and settles after response clone failure", async () => {
    const order: string[] = [];
    const response = new Response("response body");
    response.clone = () => {
      order.push("clone");
      throw new TypeError("cannot clone");
    };

    const completion = startResponseBodyCapture(13, response, {
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

    expect(order).toEqual(["begin", "clone"]);
    expect(response.bodyUsed).toBe(false);
    await completion;
    expect(order).toEqual([
      "begin",
      "clone",
      "emit:response body",
      "settle",
    ]);
    expect(response.bodyUsed).toBe(false);
  });
});
