import { describe, expect, it, vi } from "vitest";
import { installFetchWrapper } from "../../../src/transport/installFetchWrapper";

describe("installFetchWrapper", () => {
  it("[NET-INSTALL-008,010][NET-NATIVE-001] captures and binds the installed Fetch implementation", () => {
    const response = new Response();
    const nativePromise = Promise.resolve(response);
    let receiver: unknown;
    const nativeFetch: typeof fetch = function nativeFetch(this: unknown) {
      receiver = this;
      return nativePromise;
    };
    const target = { fetch: nativeFetch };
    const invoke = vi.fn(
      (
        capturedFetch: typeof fetch,
        input: RequestInfo | URL,
        init?: RequestInit,
      ) => capturedFetch(input, init),
    );

    expect(installFetchWrapper(target, invoke)).toBe(true);
    expect(target.fetch).not.toBe(nativeFetch);

    const init = { method: "POST" };
    const returnedPromise = target.fetch("https://example.test", init);

    expect(returnedPromise).toBe(nativePromise);
    expect(receiver).toBe(target);
    expect(invoke).toHaveBeenCalledOnce();
    expect(invoke.mock.calls[0]?.[1]).toBe("https://example.test");
    expect(invoke.mock.calls[0]?.[2]).toBe(init);
  });

  it("[NET-INSTALL-012] skips an unavailable Fetch implementation", () => {
    const target: { fetch?: typeof fetch } = {};
    const invoke = vi.fn();

    expect(installFetchWrapper(target, invoke)).toBe(false);
    expect(invoke).not.toHaveBeenCalled();
    expect(target.fetch).toBeUndefined();
  });
});
