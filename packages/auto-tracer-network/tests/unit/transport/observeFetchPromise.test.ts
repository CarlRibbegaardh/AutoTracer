import { describe, expect, it, vi } from "vitest";
import { observeFetchPromise } from "../../../src/transport/observeFetchPromise";

describe("observeFetchPromise", () => {
  it("[NET-EVENT-004][NET-NATIVE-001] observes resolution and returns the native promise", async () => {
    const response = new Response("ok");
    const nativePromise = Promise.resolve(response);
    const onResolved = vi.fn();

    const returnedPromise = observeFetchPromise(
      nativePromise,
      onResolved,
      vi.fn(),
    );

    expect(returnedPromise).toBe(nativePromise);
    await expect(returnedPromise).resolves.toBe(response);
    expect(onResolved).toHaveBeenCalledExactlyOnceWith(response);
  });

  it("[NET-EVENT-004][NET-NATIVE-001] observes rejection without replacing its reason", async () => {
    const failure = new TypeError("fetch failed");
    const nativePromise = Promise.reject<Response>(failure);
    const onRejected = vi.fn();

    const returnedPromise = observeFetchPromise(
      nativePromise,
      vi.fn(),
      onRejected,
    );

    expect(returnedPromise).toBe(nativePromise);
    await expect(returnedPromise).rejects.toBe(failure);
    expect(onRejected).toHaveBeenCalledExactlyOnceWith(failure);
  });

  it("[NET-NATIVE-001,005] isolates observer failure from native settlement", async () => {
    const response = new Response("ok");
    const nativePromise = Promise.resolve(response);

    const returnedPromise = observeFetchPromise(
      nativePromise,
      () => {
        throw new Error("observer failed");
      },
      vi.fn(),
    );

    await expect(returnedPromise).resolves.toBe(response);
  });
});
