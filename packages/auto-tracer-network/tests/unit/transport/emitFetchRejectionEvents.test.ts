import { describe, expect, it, vi } from "vitest";
import { createFetchRejectionEvents } from "../../../src/transport/createFetchRejectionEvents";
import { emitFetchRejectionEvents } from "../../../src/transport/emitFetchRejectionEvents";

describe("emitFetchRejectionEvents", () => {
  it("[NET-EVENT-002,009][NET-OUTCOME-002,008] emits FAILED before the separate native failure detail", () => {
    const events = createFetchRejectionEvents({
      requestId: 8,
      method: "POST",
      requestedUrl: "/api/orders",
      elapsedMilliseconds: 42,
      failure: new TypeError("fetch failed"),
    });
    const emit = vi.fn();

    emitFetchRejectionEvents(events, emit);

    expect(emit).toHaveBeenNthCalledWith(1, events.completion);
    expect(emit).toHaveBeenNthCalledWith(2, events.failureDetail);
    expect(emit).toHaveBeenCalledTimes(2);
  });

  it("[NET-EVENT-002][NET-OUTCOME-002] emits only FAILED when native failure identity is unavailable", () => {
    const events = createFetchRejectionEvents({
      requestId: 9,
      method: "GET",
      requestedUrl: "/api/orders",
      elapsedMilliseconds: 17,
      failure: "connection failed",
    });
    const emit = vi.fn();

    emitFetchRejectionEvents(events, emit);

    expect(emit).toHaveBeenCalledExactlyOnceWith(events.completion);
  });
});
