import { describe, expect, it } from "vitest";
import { createFailedCompletionEvent } from "../../../src/events/createFailedCompletionEvent";

describe("createFailedCompletionEvent", () => {
  it("[NET-OUTCOME-002][NET-OUTCOME-007] creates a semantic FAILED completion without embedded failure detail", () => {
    expect(
      createFailedCompletionEvent({
        requestId: 12,
        method: "POST",
        url: "/api/orders",
        elapsedMilliseconds: 231,
      }),
    ).toEqual({
      kind: "failed-completion",
      tokens: [
        { role: "identity", text: "Network #12" },
        { role: "direction", text: " <- " },
        { role: "outcome", text: "FAILED" },
        { role: "plain", text: " " },
        { role: "method", text: "POST" },
        { role: "plain", text: " " },
        { role: "url", text: "/api/orders" },
        { role: "plain", text: " (" },
        { role: "duration", text: "231 ms" },
        { role: "plain", text: ")" },
      ],
    });
  });
});
