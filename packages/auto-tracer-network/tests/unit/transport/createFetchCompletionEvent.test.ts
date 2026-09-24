import { describe, expect, it } from "vitest";
import { createHttpCompletionEvent } from "../../../src/events/createHttpCompletionEvent";
import { createRedirectCompletionEvent } from "../../../src/events/createRedirectCompletionEvent";
import { createFetchCompletionEvent } from "../../../src/transport/createFetchCompletionEvent";

describe("createFetchCompletionEvent", () => {
  it("[NET-EVENT-004][NET-URL-004,006] creates an ordinary completion from the requested URL", () => {
    expect(
      createFetchCompletionEvent({
        requestId: 4,
        status: 204,
        method: "POST",
        requestedUrl: "/api/orders",
        responseUrl: "https://example.test/ignored",
        redirected: false,
        elapsedMilliseconds: 25,
      }),
    ).toEqual(
      createHttpCompletionEvent({
        requestId: 4,
        status: 204,
        method: "POST",
        url: "/api/orders",
        elapsedMilliseconds: 25,
      }),
    );
  });

  it("[NET-EVENT-004][NET-URL-001..004,006] creates a redirected completion from the final response URL", () => {
    expect(
      createFetchCompletionEvent({
        requestId: 5,
        status: 200,
        method: "GET",
        requestedUrl: "/api/account",
        responseUrl: "https://auth.example.test/account",
        redirected: true,
        elapsedMilliseconds: 180,
      }),
    ).toEqual(
      createRedirectCompletionEvent({
        requestId: 5,
        status: 200,
        method: "GET",
        requestedUrl: "/api/account",
        finalUrl: "https://auth.example.test/account",
        elapsedMilliseconds: 180,
      }),
    );
  });
});
