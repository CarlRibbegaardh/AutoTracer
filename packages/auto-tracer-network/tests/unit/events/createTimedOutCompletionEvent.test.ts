import { describe, expect, it } from "vitest";
import { createTimedOutCompletionEvent } from "../../../src/events/createTimedOutCompletionEvent";

describe("createTimedOutCompletionEvent", () => {
  it("[NET-OUTCOME-004][NET-OUTCOME-007] creates semantic TIMED OUT completion tokens", () => {
    expect(
      createTimedOutCompletionEvent({
        requestId: 9,
        method: "PUT",
        url: "/update",
        elapsedMilliseconds: 5_000,
      }),
    ).toEqual({
      kind: "timed-out-completion",
      tokens: [
        { role: "identity", text: "Network #9" },
        { role: "direction", text: " <- " },
        { role: "outcome", text: "TIMED OUT" },
        { role: "plain", text: " " },
        { role: "method", text: "PUT" },
        { role: "plain", text: " " },
        { role: "url", text: "/update" },
        { role: "plain", text: " (" },
        { role: "duration", text: "5.00 s" },
        { role: "plain", text: ")" },
      ],
    });
  });
});
