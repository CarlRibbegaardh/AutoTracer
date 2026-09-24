import { describe, expect, it } from "vitest";
import { createStructuredDetailEvent } from "../../../src/events/createStructuredDetailEvent";

describe("createStructuredDetailEvent", () => {
  it("[NET-EVENT-009][NET-OUTCOME-008..009][NET-OUTPUT-003,005] creates a detached correlated failure detail", () => {
    const failure = { name: "TypeError", message: "fetch rejected" };
    const event = createStructuredDetailEvent(12, "failure", failure);

    failure.message = "changed later";

    expect(event).toEqual({
      kind: "structured-detail",
      tokens: [
        { role: "identity", text: "Network #12" },
        { role: "plain", text: "   " },
        { role: "label", text: "failure" },
        { role: "plain", text: ": " },
      ],
      value: { name: "TypeError", message: "fetch rejected" },
    });
    expect(event.value).not.toBe(failure);
    expect(event.value).not.toHaveProperty("stack");
  });
});
