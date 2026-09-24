import { describe, expect, it, vi } from "vitest";
import { invokeObservedXhrSend } from "../../../src/transport/invokeObservedXhrSend";

describe("invokeObservedXhrSend", () => {
  it("[NET-NATIVE-002] invokes native send with the original body argument", () => {
    const nativeSend = vi.fn();
    const body = new URLSearchParams({ title: "trace" });

    invokeObservedXhrSend(nativeSend, [body], vi.fn());

    expect(nativeSend).toHaveBeenCalledExactlyOnceWith(body);
  });

  it("[NET-NATIVE-002] preserves an omitted native send argument", () => {
    const nativeSend = vi.fn();

    invokeObservedXhrSend(nativeSend, [], vi.fn());

    expect(nativeSend).toHaveBeenCalledExactlyOnceWith();
  });

  it("[NET-EVENT-012][NET-NATIVE-002,005] observes and rethrows the exact native failure", () => {
    const failure = new DOMException("invalid state", "InvalidStateError");
    const observeFailure = vi.fn(() => {
      throw new Error("observer failed");
    });

    expect(() =>
      invokeObservedXhrSend(
        () => {
          throw failure;
        },
        [null],
        observeFailure,
      ),
    ).toThrow(failure);
    expect(observeFailure).toHaveBeenCalledExactlyOnceWith(failure);
  });
});
