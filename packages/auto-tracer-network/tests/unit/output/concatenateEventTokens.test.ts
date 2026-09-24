import { describe, expect, it } from "vitest";
import { concatenateEventTokens } from "../../../src/output/concatenateEventTokens";

describe("concatenateEventTokens", () => {
  it("[NET-OUTPUT-004][NET-OUTPUT-006] concatenates semantic tokens without changing their text", () => {
    expect(
      concatenateEventTokens([
        { role: "identity", text: "Network #12" },
        { role: "direction", text: " <- " },
        { role: "outcome", text: "FAILED" },
        { role: "plain", text: " (" },
        { role: "duration", text: "231 ms" },
        { role: "plain", text: ")" },
      ]),
    ).toBe("Network #12 <- FAILED (231 ms)");
  });

  it("[NET-OUTPUT-004] returns empty text for an empty token list", () => {
    expect(concatenateEventTokens([])).toBe("");
  });
});
