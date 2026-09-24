import { describe, expect, it } from "vitest";
import { createFailedCompletionEvent } from "../../../src/events/createFailedCompletionEvent";
import { createStructuredDetailEvent } from "../../../src/events/createStructuredDetailEvent";
import { createFetchRejectionEvents } from "../../../src/transport/createFetchRejectionEvents";

describe("createFetchRejectionEvents", () => {
  it("[NET-OUTCOME-002,008..009] creates FAILED completion and separate native failure detail", () => {
    const failure = Object.assign(new TypeError("fetch failed"), {
      stack: "hidden stack",
    });

    expect(
      createFetchRejectionEvents({
        requestId: 8,
        method: "POST",
        requestedUrl: "/api/orders",
        elapsedMilliseconds: 42,
        failure,
      }),
    ).toEqual({
      completion: createFailedCompletionEvent({
        requestId: 8,
        method: "POST",
        url: "/api/orders",
        elapsedMilliseconds: 42,
      }),
      failureDetail: createStructuredDetailEvent(8, "failure", {
        name: "TypeError",
        message: "fetch failed",
      }),
    });
  });

  it("[NET-OUTCOME-002,008] omits failure detail when native identity is unavailable", () => {
    expect(
      createFetchRejectionEvents({
        requestId: 9,
        method: "GET",
        requestedUrl: "/api/orders",
        elapsedMilliseconds: 17,
        failure: "connection failed",
      }),
    ).toEqual({
      completion: createFailedCompletionEvent({
        requestId: 9,
        method: "GET",
        url: "/api/orders",
        elapsedMilliseconds: 17,
      }),
    });
  });
});
