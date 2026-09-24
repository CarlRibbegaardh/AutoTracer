import { describe, expect, it, vi } from "vitest";
import { createRequestStartEvent } from "../../../src/events/createRequestStartEvent";
import { invokeFetchByAdmission } from "../../../src/transport/invokeFetchByAdmission";

describe("invokeFetchByAdmission", () => {
  it("[NET-FILTER-005..006,009][NET-NATIVE-001] delegates a hidden request without output", async () => {
    const input = new Request("https://example.test/private/orders");
    const init = { method: "POST" } as const;
    const response = new Response("hidden");
    const nativePromise = Promise.resolve(response);
    const nativeFetch = vi.fn(() => nativePromise);
    const emit = vi.fn();
    const beginPendingWork = vi.fn();
    const settlePendingWork = vi.fn();

    const returnedPromise = invokeFetchByAdmission(
      nativeFetch,
      { input, init },
      {
        admitted: false,
        requestId: 1,
        method: "POST",
        requestedUrl: input.url,
        startMarker: 100,
        getCompletionMarker: () => 125,
        beginPendingWork,
        canEmitPendingOutput: () => true,
        settlePendingWork,
        emit,
      },
    );

    expect(nativeFetch).toHaveBeenCalledExactlyOnceWith(input, init);
    expect(returnedPromise).toBe(nativePromise);
    await expect(returnedPromise).resolves.toBe(response);
    expect(emit).not.toHaveBeenCalled();
    expect(beginPendingWork).not.toHaveBeenCalled();
    expect(settlePendingWork).not.toHaveBeenCalled();
  });

  it("[NET-AUTOSTOP-003][NET-NATIVE-001] delegates a post-limit request without output", async () => {
    const nativePromise = Promise.resolve(new Response("untraced"));
    const emit = vi.fn();
    const beginPendingWork = vi.fn();
    const settlePendingWork = vi.fn();

    const returnedPromise = invokeFetchByAdmission(
      () => nativePromise,
      { input: "/api/orders" },
      {
        admitted: false,
        requestId: 4,
        method: "GET",
        requestedUrl: "/api/orders",
        startMarker: 20,
        getCompletionMarker: () => 30,
        beginPendingWork,
        canEmitPendingOutput: () => true,
        settlePendingWork,
        emit,
      },
    );

    expect(returnedPromise).toBe(nativePromise);
    await returnedPromise;
    expect(emit).not.toHaveBeenCalled();
    expect(beginPendingWork).not.toHaveBeenCalled();
    expect(settlePendingWork).not.toHaveBeenCalled();
  });

  it("[NET-EVENT-001][NET-NATIVE-001] routes an admitted request through traced execution", async () => {
    const nativePromise = Promise.resolve(new Response("traced"));
    const emit = vi.fn();
    const beginPendingWork = vi.fn();
    const settlePendingWork = vi.fn();

    const returnedPromise = invokeFetchByAdmission(
      () => nativePromise,
      { input: "/api/orders" },
      {
        admitted: true,
        requestId: 2,
        method: "GET",
        requestedUrl: "/api/orders",
        startMarker: 20,
        getCompletionMarker: () => 30,
        beginPendingWork,
        canEmitPendingOutput: () => true,
        settlePendingWork,
        emit,
      },
    );

    expect(returnedPromise).toBe(nativePromise);
    expect(emit).toHaveBeenNthCalledWith(
      1,
      createRequestStartEvent(2, "GET", "/api/orders"),
    );
    await returnedPromise;
    expect(beginPendingWork).toHaveBeenCalledOnce();
    expect(settlePendingWork).toHaveBeenCalledOnce();
  });
});
