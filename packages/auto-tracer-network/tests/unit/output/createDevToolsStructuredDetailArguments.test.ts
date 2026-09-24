import { describe, expect, it } from "vitest";
import { createDevToolsStructuredDetailArguments } from "../../../src/output/createDevToolsStructuredDetailArguments";
import { defaultNetworkTheme } from "../../../src/theme/defaultNetworkTheme";

describe("createDevToolsStructuredDetailArguments", () => {
  it("[NET-EVENT-009][NET-OUTPUT-003,005,008] appends a detached expandable value after aligned token styles", () => {
    const value = { status: "initial" };
    const event = {
      kind: "structured-detail" as const,
      tokens: [
        { role: "identity" as const, text: "Network #12" },
        { role: "plain" as const, text: "   " },
        { role: "label" as const, text: "request headers" },
        { role: "plain" as const, text: ": " },
      ],
      value,
    };

    const result = createDevToolsStructuredDetailArguments(
      event,
      defaultNetworkTheme,
      "light",
    );
    value.status = "changed";

    expect(result).toEqual([
      "%cNetwork #12%c   %crequest headers%c: ",
      "color: #0000ff; font-weight: bold",
      "",
      "color: #267f99",
      "",
      { status: "initial" },
    ]);
  });
});
