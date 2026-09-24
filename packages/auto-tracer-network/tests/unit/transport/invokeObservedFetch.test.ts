import { describe, expect, it, vi } from "vitest";
import { invokeObservedFetch } from "../../../src/transport/invokeObservedFetch";

describe("invokeObservedFetch", () => {
  it("[NET-EVENT-004][NET-NATIVE-001] invokes native Fetch with the original inputs and observes resolution", async () => {
    const input = new Request("https://example.test/orders");
    const init = { method: "POST" } as const;
    const response = new Response("ok");
    const nativePromise = Promise.resolve(response);
    const nativeFetch = vi.fn(() => nativePromise);
    const onResolved = vi.fn();

    const returnedPromise = invokeObservedFetch(
      nativeFetch,
      { input, init },
      {
        onResolved,
        onRejected: vi.fn(),
        onSynchronousFailure: vi.fn(),
      },
    );

    expect(nativeFetch).toHaveBeenCalledExactlyOnceWith(input, init);
    expect(returnedPromise).toBe(nativePromise);
    await expect(returnedPromise).resolves.toBe(response);
    expect(onResolved).toHaveBeenCalledExactlyOnceWith(response);
  });

  it("[NET-EVENT-004][NET-NATIVE-001] observes rejection without replacing the native reason", async () => {
    const failure = new TypeError("fetch rejected");
    const nativePromise = Promise.reject<Response>(failure);
    const onRejected = vi.fn();

    const returnedPromise = invokeObservedFetch(
      () => nativePromise,
      { input: "/orders" },
      {
        onResolved: vi.fn(),
        onRejected,
        onSynchronousFailure: vi.fn(),
      },
    );

    expect(returnedPromise).toBe(nativePromise);
    await expect(returnedPromise).rejects.toBe(failure);
    expect(onRejected).toHaveBeenCalledExactlyOnceWith(failure);
  });

  it("[NET-EVENT-012][NET-NATIVE-001] observes and rethrows a synchronous native failure", () => {
    const failure = new TypeError("fetch threw");
    const onSynchronousFailure = vi.fn();

    expect(() =>
      invokeObservedFetch(
        () => {
          throw failure;
        },
        { input: "/orders" },
        {
          onResolved: vi.fn(),
          onRejected: vi.fn(),
          onSynchronousFailure,
        },
      ),
    ).toThrow(failure);
    expect(onSynchronousFailure).toHaveBeenCalledExactlyOnceWith(failure);
  });
});
