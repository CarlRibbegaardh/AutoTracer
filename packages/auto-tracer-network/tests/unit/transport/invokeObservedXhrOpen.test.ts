import { describe, expect, it, vi } from "vitest";
import { invokeObservedXhrOpen } from "../../../src/transport/invokeObservedXhrOpen";

describe("invokeObservedXhrOpen", () => {
  it("[NET-NATIVE-002] invokes native open with the original argument tuple before observation", () => {
    const order: string[] = [];
    const nativeOpen = vi.fn(() => {
      order.push("native");
    });

    invokeObservedXhrOpen(
      nativeOpen,
      ["POST", "/api/orders", false, "developer", "secret"],
      () => {
        order.push("observe");
      },
    );

    expect(nativeOpen).toHaveBeenCalledExactlyOnceWith(
      "POST",
      "/api/orders",
      false,
      "developer",
      "secret",
    );
    expect(order).toEqual(["native", "observe"]);
  });

  it("[NET-NATIVE-002,005] preserves a native open throw without observing success", () => {
    const failure = new DOMException("invalid method", "SyntaxError");
    const observeOpen = vi.fn();

    expect(() =>
      invokeObservedXhrOpen(
        () => {
          throw failure;
        },
        ["INVALID METHOD", "/api/orders"],
        observeOpen,
      ),
    ).toThrow(failure);
    expect(observeOpen).not.toHaveBeenCalled();
  });

  it("[NET-NATIVE-002,005] isolates tracing failure after native open succeeds", () => {
    expect(() =>
      invokeObservedXhrOpen(vi.fn(), ["GET", "/api/orders"], () => {
        throw new Error("observer failed");
      }),
    ).not.toThrow();
  });
});
