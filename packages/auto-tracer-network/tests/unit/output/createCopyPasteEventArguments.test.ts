import { describe, expect, it } from "vitest";
import { createUnavailableDetailEvent } from "../../../src/events/createUnavailableDetailEvent";
import { createCopyPasteEventArguments } from "../../../src/output/createCopyPasteEventArguments";

describe("createCopyPasteEventArguments", () => {
  it("[NET-EVENT-009][NET-OUTCOME-010][NET-OUTPUT-004,006] creates one plain argument for a token event", () => {
    const event = createUnavailableDetailEvent(7, "response body");

    expect(createCopyPasteEventArguments(event)).toEqual([
      "Network #7   response body UNAVAILABLE",
    ]);
  });
});
