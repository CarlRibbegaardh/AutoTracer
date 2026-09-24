import { describe, expect, it, vi } from "vitest";
import { createFetchOutcomeObservers } from "../../../src/transport/createFetchOutcomeObservers";
import { createFetchResponseEvent } from "../../../src/transport/createFetchResponseEvent";
import { createTimedFetchRejectionEvents } from "../../../src/transport/createTimedFetchRejectionEvents";

describe("createFetchOutcomeObservers", () => {
  it("[NET-EVENT-004,006,012] composes response and shared rejection observers", () => {
    const getCompletionMarker = vi
      .fn<() => number>()
      .mockReturnValueOnce(184)
      .mockReturnValueOnce(210);
    const emit = vi.fn();
    const observers = createFetchOutcomeObservers({
      requestId: 12,
      method: "POST",
      requestedUrl: "/api/orders",
      startMarker: 100,
      getCompletionMarker,
      emit,
    });
    const response = new Response("ok", { status: 201 });
    const failure = new TypeError("fetch failed");

    expect(observers.onRejected).toBe(observers.onSynchronousFailure);

    observers.onResolved(response);
    observers.onRejected(failure);

    const rejectionEvents = createTimedFetchRejectionEvents({
      requestId: 12,
      method: "POST",
      requestedUrl: "/api/orders",
      startMarker: 100,
      completionMarker: 210,
      failure,
    });
    expect(emit).toHaveBeenNthCalledWith(
      1,
      createFetchResponseEvent({
        requestId: 12,
        method: "POST",
        requestedUrl: "/api/orders",
        startMarker: 100,
        completionMarker: 184,
        response,
      }),
    );
    expect(emit).toHaveBeenNthCalledWith(2, rejectionEvents.completion);
    expect(emit).toHaveBeenNthCalledWith(3, rejectionEvents.failureDetail);
    expect(getCompletionMarker).toHaveBeenCalledTimes(2);
  });
});
