import { describe, expect, it, vi } from "vitest";
import { createFetchResponseEvent } from "../../../src/transport/createFetchResponseEvent";
import { createRequestStartEvent } from "../../../src/events/createRequestStartEvent";
import { createTimedFetchRejectionEvents } from "../../../src/transport/createTimedFetchRejectionEvents";
import { invokeTracedFetchRequest } from "../../../src/transport/invokeTracedFetchRequest";

describe("invokeTracedFetchRequest", () => {
  it("[NET-EVENT-001,004,006][NET-ID-008][NET-STOP-005][NET-NATIVE-001] tracks pending work around native Fetch", async () => {
    const order: string[] = [];
    const emitted: unknown[] = [];
    const response = new Response("ok", { status: 201 });
    const nativePromise = Promise.resolve(response);
    const nativeFetch = vi.fn(() => {
      order.push("native");
      return nativePromise;
    });
    const emit = vi.fn((event: unknown) => emitted.push(event));

    const returnedPromise = invokeTracedFetchRequest(
      nativeFetch,
      { input: "/api/orders", init: { method: "POST" } },
      {
        requestId: 12,
        method: "POST",
        requestedUrl: "/api/orders",
        startMarker: 100,
        getCompletionMarker: () => 184,
        beginPendingWork: () => {
          order.push("begin");
        },
        startRequestDetails: () => {
          order.push("request-details");
        },
        startResponseDetails: () => {
          order.push("response-details");
        },
        canEmitPendingOutput: () => true,
        settlePendingWork: () => {
          order.push("settle");
        },
        emit: (event) => {
          order.push("emit");
          emit(event);
        },
      },
    );

    expect(order).toEqual(["begin", "emit", "request-details", "native"]);
    expect(returnedPromise).toBe(nativePromise);
    await returnedPromise;
    expect(order).toEqual([
      "begin",
      "emit",
      "request-details",
      "native",
      "emit",
      "response-details",
      "settle",
    ]);
    expect(emitted).toEqual([
      createRequestStartEvent(12, "POST", "/api/orders"),
      createFetchResponseEvent({
        requestId: 12,
        method: "POST",
        requestedUrl: "/api/orders",
        startMarker: 100,
        completionMarker: 184,
        response,
      }),
    ]);
  });

  it("[NET-EVENT-001,004,006][NET-ID-008][NET-OUTCOME-002] settles pending work when the native promise rejects", async () => {
    const failure = "fetch rejected";
    const nativePromise = Promise.reject<Response>(failure);
    const emit = vi.fn();
    const beginPendingWork = vi.fn();
    const settlePendingWork = vi.fn();

    const returnedPromise = invokeTracedFetchRequest(
      () => nativePromise,
      { input: "/api/orders" },
      {
        requestId: 13,
        method: "GET",
        requestedUrl: "/api/orders",
        startMarker: 20,
        getCompletionMarker: () => 45,
        beginPendingWork,
        startRequestDetails: vi.fn(),
        startResponseDetails: vi.fn(),
        canEmitPendingOutput: () => true,
        settlePendingWork,
        emit,
      },
    );

    expect(returnedPromise).toBe(nativePromise);
    await expect(returnedPromise).rejects.toBe(failure);
    expect(emit).toHaveBeenNthCalledWith(
      1,
      createRequestStartEvent(13, "GET", "/api/orders"),
    );
    expect(emit).toHaveBeenNthCalledWith(
      2,
      createTimedFetchRejectionEvents({
        requestId: 13,
        method: "GET",
        requestedUrl: "/api/orders",
        startMarker: 20,
        completionMarker: 45,
        failure,
      }).completion,
    );
    expect(beginPendingWork).toHaveBeenCalledOnce();
    expect(settlePendingWork).toHaveBeenCalledOnce();
  });

  it("[NET-EVENT-001,012][NET-ID-008][NET-NATIVE-001] settles pending work before rethrowing the original synchronous failure", () => {
    const failure = "fetch threw";
    const emit = vi.fn();
    const beginPendingWork = vi.fn();
    const settlePendingWork = vi.fn();

    expect(() =>
      invokeTracedFetchRequest(
        () => {
          throw failure;
        },
        { input: "/api/orders" },
        {
          requestId: 14,
          method: "GET",
          requestedUrl: "/api/orders",
          startMarker: 30,
          getCompletionMarker: () => 32,
          beginPendingWork,
          startRequestDetails: vi.fn(),
          startResponseDetails: vi.fn(),
          canEmitPendingOutput: () => true,
          settlePendingWork,
          emit,
        },
      ),
    ).toThrow(failure);
    expect(emit).toHaveBeenNthCalledWith(
      1,
      createRequestStartEvent(14, "GET", "/api/orders"),
    );
    expect(emit).toHaveBeenNthCalledWith(
      2,
      createTimedFetchRejectionEvents({
        requestId: 14,
        method: "GET",
        requestedUrl: "/api/orders",
        startMarker: 30,
        completionMarker: 32,
        failure,
      }).completion,
    );
    expect(beginPendingWork).toHaveBeenCalledOnce();
    expect(settlePendingWork).toHaveBeenCalledOnce();
  });
});
