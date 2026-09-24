import { describe, expect, it } from "vitest";
import { createUnavailableDetailEvent } from "../../../src/events/createUnavailableDetailEvent";

describe("createUnavailableDetailEvent", () => {
  it("[NET-EVENT-009][NET-OUTCOME-010] creates a correlated unavailable detail without a value", () => {
    expect(createUnavailableDetailEvent(12, "response body")).toEqual({
      kind: "unavailable-detail",
      tokens: [
        { role: "identity", text: "Network #12" },
        { role: "plain", text: "   " },
        { role: "label", text: "response body" },
        { role: "plain", text: " " },
        { role: "unavailable", text: "UNAVAILABLE" },
      ],
    });
  });
});
