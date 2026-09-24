import { describe, expect, it } from "vitest";
import { createFetchCompletionEvent } from "../../../src/transport/createFetchCompletionEvent";
import { createFetchResponseEvent } from "../../../src/transport/createFetchResponseEvent";

describe("createFetchResponseEvent", () => {
  it("[NET-EVENT-004,006][NET-OUTCOME-001] creates an HTTP completion from response metadata and monotonic markers", () => {
    expect(
      createFetchResponseEvent({
        requestId: 12,
        method: "POST",
        requestedUrl: "/api/orders",
        startMarker: 100,
        completionMarker: 184,
        response: {
          status: 201,
          url: "https://example.test/api/orders",
          redirected: false,
        },
      }),
    ).toEqual(
      createFetchCompletionEvent({
        requestId: 12,
        status: 201,
        method: "POST",
        requestedUrl: "/api/orders",
        responseUrl: "https://example.test/api/orders",
        redirected: false,
        elapsedMilliseconds: 84,
      }),
    );
  });

  it("[NET-EVENT-004,006][NET-URL-001..004,006] creates a redirected completion from browser response metadata", () => {
    expect(
      createFetchResponseEvent({
        requestId: 13,
        method: "GET",
        requestedUrl: "/legacy",
        startMarker: 50,
        completionMarker: 125,
        response: {
          status: 200,
          url: "https://example.test/current",
          redirected: true,
        },
      }),
    ).toEqual(
      createFetchCompletionEvent({
        requestId: 13,
        status: 200,
        method: "GET",
        requestedUrl: "/legacy",
        responseUrl: "https://example.test/current",
        redirected: true,
        elapsedMilliseconds: 75,
      }),
    );
  });
});
