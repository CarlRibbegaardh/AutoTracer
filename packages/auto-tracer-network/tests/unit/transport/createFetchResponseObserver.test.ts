import { describe, expect, it, vi } from "vitest";
import { createFetchResponseEvent } from "../../../src/transport/createFetchResponseEvent";
import { createFetchResponseObserver } from "../../../src/transport/createFetchResponseObserver";

describe("createFetchResponseObserver", () => {
  it("[NET-EVENT-004,006] samples completion time when the response settles", () => {
    const getCompletionMarker = vi.fn(() => 184);
    const emit = vi.fn();
    const observeResponse = createFetchResponseObserver({
      requestId: 12,
      method: "POST",
      requestedUrl: "/api/orders",
      startMarker: 100,
      getCompletionMarker,
      emit,
    });
    const response = new Response("ok", { status: 201 });

    expect(getCompletionMarker).not.toHaveBeenCalled();

    observeResponse(response);

    expect(getCompletionMarker).toHaveBeenCalledOnce();
    expect(emit).toHaveBeenCalledExactlyOnceWith(
      createFetchResponseEvent({
        requestId: 12,
        method: "POST",
        requestedUrl: "/api/orders",
        startMarker: 100,
        completionMarker: 184,
        response,
      }),
    );
  });
});
