import { describe, expect, it } from "vitest";
import { createAbortedCompletionEvent } from "../../../src/events/createAbortedCompletionEvent";
import { createFailedCompletionEvent } from "../../../src/events/createFailedCompletionEvent";
import { createHttpCompletionEvent } from "../../../src/events/createHttpCompletionEvent";
import { createRedirectCompletionEvent } from "../../../src/events/createRedirectCompletionEvent";
import { createTimedOutCompletionEvent } from "../../../src/events/createTimedOutCompletionEvent";
import { createXhrTerminalEvent } from "../../../src/transport/createXhrTerminalEvent";

describe("createXhrTerminalEvent", () => {
  it("[NET-EVENT-005..007][NET-OUTCOME-001][NET-URL-007] creates an HTTP completion for native load", () => {
    expect(
      createXhrTerminalEvent({
        eventType: "load",
        requestId: 21,
        status: 204,
        method: "POST",
        requestedUrl: "/api/orders",
        normalizedRequestedUrl: "https://example.test/api/orders",
        responseUrl: "https://example.test/api/orders",
        elapsedMilliseconds: 25,
      }),
    ).toEqual(
      createHttpCompletionEvent({
        requestId: 21,
        status: 204,
        method: "POST",
        url: "/api/orders",
        elapsedMilliseconds: 25,
      }),
    );
  });

  it("[NET-EVENT-005..007][NET-OUTCOME-001][NET-URL-001..004,007] creates a redirected completion from responseURL", () => {
    expect(
      createXhrTerminalEvent({
        eventType: "load",
        requestId: 22,
        status: 200,
        method: "GET",
        requestedUrl: "/api/account",
        normalizedRequestedUrl: "https://example.test/api/account",
        responseUrl: "https://auth.example.test/account",
        elapsedMilliseconds: 180,
      }),
    ).toEqual(
      createRedirectCompletionEvent({
        requestId: 22,
        status: 200,
        method: "GET",
        requestedUrl: "/api/account",
        finalUrl: "https://auth.example.test/account",
        elapsedMilliseconds: 180,
      }),
    );
  });

  it.each([
    ["error", createFailedCompletionEvent],
    ["abort", createAbortedCompletionEvent],
    ["timeout", createTimedOutCompletionEvent],
  ] as const)(
    "[NET-EVENT-005..007][NET-OUTCOME-002..004] creates the %s transport outcome",
    (eventType, createExpectedEvent) => {
      const input = {
        requestId: 23,
        method: "GET",
        url: "/api/orders",
        elapsedMilliseconds: 40,
      } as const;

      expect(
        createXhrTerminalEvent({
          eventType,
          requestId: input.requestId,
          status: 0,
          method: input.method,
          requestedUrl: input.url,
          normalizedRequestedUrl: "https://example.test/api/orders",
          responseUrl: "",
          elapsedMilliseconds: input.elapsedMilliseconds,
        }),
      ).toEqual(createExpectedEvent(input));
    },
  );
});
