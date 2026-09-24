import { describe, expect, it, vi } from "vitest";
import { invokeNativeFetch } from "../../../src/transport/invokeNativeFetch";

describe("invokeNativeFetch", () => {
  it("[NET-NATIVE-001] preserves omitted and explicit Fetch initialization arguments", () => {
    const nativePromise = Promise.resolve(new Response());
    const nativeFetch = vi.fn(() => {
      return nativePromise;
    });

    expect(invokeNativeFetch(nativeFetch, { input: "/omitted" })).toBe(
      nativePromise,
    );
    expect(
      invokeNativeFetch(nativeFetch, {
        input: "/explicit",
        init: undefined,
        hasInit: true,
      }),
    ).toBe(nativePromise);
    expect(nativeFetch.mock.calls).toEqual([
      ["/omitted"],
      ["/explicit", undefined],
    ]);
  });
});
