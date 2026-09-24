import { describe, expect, it } from "vitest";
import { createCopyPasteStructuredDetailArguments } from "../../../src/output/createCopyPasteStructuredDetailArguments";

describe("createCopyPasteStructuredDetailArguments", () => {
  it("[NET-EVENT-009][NET-OUTPUT-004..006] emits one deterministic text argument", () => {
    const event = {
      kind: "structured-detail" as const,
      tokens: [
        { role: "identity" as const, text: "Network #12" },
        { role: "plain" as const, text: "   " },
        { role: "label" as const, text: "request headers" },
        { role: "plain" as const, text: ": " },
      ],
      value: { zeta: 2, alpha: 1 },
    };

    expect(createCopyPasteStructuredDetailArguments(event)).toEqual([
      'Network #12   request headers: {"alpha":1,"zeta":2}',
    ]);
  });

  it("[NET-OUTPUT-004,006] preserves primitive detail values", () => {
    expect(
      createCopyPasteStructuredDetailArguments({
        kind: "structured-detail",
        tokens: [{ role: "plain", text: "response body: " }],
        value: "visible",
      }),
    ).toEqual(["response body: visible"]);
  });
});
