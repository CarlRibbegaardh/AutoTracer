import { describe, expect, it } from "vitest";
import { createAbortedCompletionEvent } from "../../../src/events/createAbortedCompletionEvent";

describe("createAbortedCompletionEvent", () => {
  it("[NET-OUTCOME-003][NET-OUTCOME-007] creates semantic ABORTED completion tokens", () => {
    expect(
      createAbortedCompletionEvent({
        requestId: 8,
        method: "DELETE",
        url: "/resource",
        elapsedMilliseconds: 45,
      }),
    ).toEqual({
      kind: "aborted-completion",
      tokens: [
        { role: "identity", text: "Network #8" },
        { role: "direction", text: " <- " },
        { role: "outcome", text: "ABORTED" },
        { role: "plain", text: " " },
        { role: "method", text: "DELETE" },
        { role: "plain", text: " " },
        { role: "url", text: "/resource" },
        { role: "plain", text: " (" },
        { role: "duration", text: "45 ms" },
        { role: "plain", text: ")" },
      ],
    });
  });
});
