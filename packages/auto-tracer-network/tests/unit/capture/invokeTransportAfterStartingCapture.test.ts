import { describe, expect, it } from "vitest";
import { invokeTransportAfterStartingCapture } from "../../../src/capture/invokeTransportAfterStartingCapture";

describe("invokeTransportAfterStartingCapture", () => {
  it("[NET-CAPTURE-009] starts synchronous capture before transport invocation", () => {
    const order: string[] = [];

    invokeTransportAfterStartingCapture(
      () => {
        order.push("capture");
        return Promise.resolve();
      },
      () => {
        order.push("transport");
        return "native result";
      },
    );

    expect(order).toEqual(["capture", "transport"]);
  });

  it("[NET-CAPTURE-011] invokes transport without awaiting asynchronous capture", () => {
    let settleCapture = (): void => undefined;
    const capture = new Promise<void>((resolve) => {
      settleCapture = resolve;
    });

    const result = invokeTransportAfterStartingCapture(
      () => capture,
      () => "native result",
    );

    expect(result).toBe("native result");
    settleCapture();
  });
});
