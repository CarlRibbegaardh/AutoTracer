import { describe, expect, it, vi } from "vitest";
import { invokeTransportWithFailureObserver } from "../../../src/transport/invokeTransportWithFailureObserver";

describe("invokeTransportWithFailureObserver", () => {
  it("[NET-NATIVE-001] returns the exact native transport result", () => {
    const nativeResult = { transport: "result" };
    const onFailure = vi.fn();

    const result = invokeTransportWithFailureObserver(
      () => nativeResult,
      onFailure,
    );

    expect(result).toBe(nativeResult);
    expect(onFailure).not.toHaveBeenCalled();
  });

  it("[NET-EVENT-012][NET-NATIVE-001] observes and rethrows the original synchronous failure", () => {
    const failure = new TypeError("native fetch failed");
    const onFailure = vi.fn();

    expect(() =>
      invokeTransportWithFailureObserver(() => {
        throw failure;
      }, onFailure),
    ).toThrow(failure);
    expect(onFailure).toHaveBeenCalledExactlyOnceWith(failure);
  });

  it("[NET-NATIVE-001,005] preserves the native failure when its observer throws", () => {
    const failure = new TypeError("native fetch failed");

    expect(() =>
      invokeTransportWithFailureObserver(
        () => {
          throw failure;
        },
        () => {
          throw new Error("observer failed");
        },
      ),
    ).toThrow(failure);
  });
});
