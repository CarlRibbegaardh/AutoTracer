import { describe, expect, it } from "vitest";
import { startRequestBodyCapture } from "../../../src/capture/startRequestBodyCapture";

describe("startRequestBodyCapture", () => {
  it("[NET-ID-008][NET-CAPTURE-010..011][NET-BODY-015] registers before cloning and settles after request-body output", async () => {
    const order: string[] = [];
    const request = new Request("https://example.test/orders", {
      method: "POST",
      body: "request body",
    });
    const nativeClone = request.clone.bind(request);
    request.clone = () => {
      order.push("clone");
      return nativeClone();
    };

    const completion = startRequestBodyCapture(12, request, {
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
    expect(request.bodyUsed).toBe(false);
    await completion;
    expect(order).toEqual([
      "begin",
      "clone",
      "emit:request body",
      "settle",
    ]);
    expect(request.bodyUsed).toBe(false);
  });
});
