import { describe, expect, it, vi } from "vitest";
import { createFetchRejectionObserver } from "../../../src/transport/createFetchRejectionObserver";
import { createTimedFetchRejectionEvents } from "../../../src/transport/createTimedFetchRejectionEvents";

describe("createFetchRejectionObserver", () => {
  it("[NET-EVENT-004,006,009][NET-OUTCOME-002,008] samples completion time and emits rejection events in order", () => {
    const getCompletionMarker = vi.fn(() => 142);
    const emit = vi.fn();
    const observeRejection = createFetchRejectionObserver({
      requestId: 14,
      method: "POST",
      requestedUrl: "/api/orders",
      startMarker: 100,
      getCompletionMarker,
      emit,
    });
    const failure = new TypeError("fetch failed");
    const events = createTimedFetchRejectionEvents({
      requestId: 14,
      method: "POST",
      requestedUrl: "/api/orders",
      startMarker: 100,
      completionMarker: 142,
      failure,
    });

    expect(getCompletionMarker).not.toHaveBeenCalled();

    observeRejection(failure);

    expect(getCompletionMarker).toHaveBeenCalledOnce();
    expect(emit).toHaveBeenNthCalledWith(1, events.completion);
    expect(emit).toHaveBeenNthCalledWith(2, events.failureDetail);
    expect(emit).toHaveBeenCalledTimes(2);
  });

  it("[NET-EVENT-004,006][NET-OUTCOME-002] emits only FAILED for an unidentified rejection", () => {
    const emit = vi.fn();
    const observeRejection = createFetchRejectionObserver({
      requestId: 15,
      method: "GET",
      requestedUrl: "/api/orders",
      startMarker: 25,
      getCompletionMarker: () => 42,
      emit,
    });
    const failure = "connection failed";
    const events = createTimedFetchRejectionEvents({
      requestId: 15,
      method: "GET",
      requestedUrl: "/api/orders",
      startMarker: 25,
      completionMarker: 42,
      failure,
    });

    observeRejection(failure);

    expect(emit).toHaveBeenCalledExactlyOnceWith(events.completion);
  });
});
