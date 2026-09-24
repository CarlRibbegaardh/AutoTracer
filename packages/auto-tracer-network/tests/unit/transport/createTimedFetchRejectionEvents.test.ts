import { describe, expect, it } from "vitest";
import { createFetchRejectionEvents } from "../../../src/transport/createFetchRejectionEvents";
import { createTimedFetchRejectionEvents } from "../../../src/transport/createTimedFetchRejectionEvents";

describe("createTimedFetchRejectionEvents", () => {
  it("[NET-EVENT-004,006][NET-OUTCOME-002,008..009] creates timed rejection events for a native Error", () => {
    const failure = new TypeError("fetch failed");

    expect(
      createTimedFetchRejectionEvents({
        requestId: 14,
        method: "POST",
        requestedUrl: "/api/orders",
        startMarker: 100,
        completionMarker: 142,
        failure,
      }),
    ).toEqual(
      createFetchRejectionEvents({
        requestId: 14,
        method: "POST",
        requestedUrl: "/api/orders",
        elapsedMilliseconds: 42,
        failure,
      }),
    );
  });

  it("[NET-EVENT-004,006][NET-OUTCOME-002] creates a timed FAILED event for an unidentified rejection", () => {
    expect(
      createTimedFetchRejectionEvents({
        requestId: 15,
        method: "GET",
        requestedUrl: "/api/orders",
        startMarker: 25,
        completionMarker: 42,
        failure: "connection failed",
      }),
    ).toEqual(
      createFetchRejectionEvents({
        requestId: 15,
        method: "GET",
        requestedUrl: "/api/orders",
        elapsedMilliseconds: 17,
        failure: "connection failed",
      }),
    );
  });
});
