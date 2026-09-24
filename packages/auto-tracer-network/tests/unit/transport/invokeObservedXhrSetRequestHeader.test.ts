import { describe, expect, it, vi } from "vitest";
import { invokeObservedXhrSetRequestHeader } from "../../../src/transport/invokeObservedXhrSetRequestHeader";

describe("invokeObservedXhrSetRequestHeader", () => {
  it("[NET-CAPTURE-004][NET-NATIVE-002] observes the original header only after native success", () => {
    const order: string[] = [];
    const nativeSetRequestHeader = vi.fn(() => {
      order.push("native");
    });

    invokeObservedXhrSetRequestHeader(
      nativeSetRequestHeader,
      ["X-Trace", "visible"],
      () => {
        order.push("observe");
      },
    );

    expect(nativeSetRequestHeader).toHaveBeenCalledExactlyOnceWith(
      "X-Trace",
      "visible",
    );
    expect(order).toEqual(["native", "observe"]);
  });

  it("[NET-NATIVE-002,005] preserves native failure without recording the header", () => {
    const failure = new DOMException("invalid state", "InvalidStateError");
    const observeHeader = vi.fn();

    expect(() =>
      invokeObservedXhrSetRequestHeader(
        () => {
          throw failure;
        },
        ["X-Trace", "visible"],
        observeHeader,
      ),
    ).toThrow(failure);
    expect(observeHeader).not.toHaveBeenCalled();
  });

  it("[NET-NATIVE-002,005] isolates tracing failure after native header success", () => {
    expect(() =>
      invokeObservedXhrSetRequestHeader(
        vi.fn(),
        ["X-Trace", "visible"],
        () => {
          throw new Error("observer failed");
        },
      ),
    ).not.toThrow();
  });
});
