import { describe, expect, it } from "vitest";
import { createHttpCompletionEvent } from "../../../src/events/createHttpCompletionEvent";

describe("createHttpCompletionEvent", () => {
  it("[NET-EVENT-002][NET-EVENT-006..008][NET-OUTCOME-001][NET-OUTCOME-006] creates semantic HTTP completion tokens", () => {
    expect(
      createHttpCompletionEvent({
        requestId: 13,
        status: 500,
        method: "GET",
        url: "/api/profile",
        elapsedMilliseconds: 1_250,
      }),
    ).toEqual({
      kind: "http-completion",
      tokens: [
        { role: "identity", text: "Network #13" },
        { role: "direction", text: " <- " },
        { role: "status", text: "500" },
        { role: "plain", text: " " },
        { role: "method", text: "GET" },
        { role: "plain", text: " " },
        { role: "url", text: "/api/profile" },
        { role: "plain", text: " (" },
        { role: "duration", text: "1.25 s" },
        { role: "plain", text: ")" },
      ],
    });
  });
});
