import { describe, expect, it } from "vitest";
import type { EventToken } from "../../../src/events/EventToken";
import { renderEventTokensForDevTools } from "../../../src/output/renderEventTokensForDevTools";
import { defaultNetworkTheme } from "../../../src/theme/defaultNetworkTheme";

describe("renderEventTokensForDevTools", () => {
  it("[NET-OUTPUT-007..008] emits one placeholder and one light-mode style per token", () => {
    const tokens: readonly EventToken[] = [
      { role: "identity", text: "Network #1" },
      { role: "direction", text: " -> " },
      { role: "method", text: "GET" },
      { role: "url", text: " /api/orders" },
    ];

    expect(
      renderEventTokensForDevTools(tokens, defaultNetworkTheme, "light"),
    ).toEqual({
      format: "%cNetwork #1%c -> %cGET%c /api/orders",
      styles: ["color: #0000ff; font-weight: bold", "", "color: #795e26", ""],
    });
  });

  it("[NET-OUTCOME-006..007][NET-OUTPUT-008] selects dark semantic styles", () => {
    const tokens: readonly EventToken[] = [
      { role: "status", text: "500" },
      { role: "plain", text: " " },
      { role: "runtime-control", text: "Network tracing stopped" },
    ];

    expect(
      renderEventTokensForDevTools(tokens, defaultNetworkTheme, "dark"),
    ).toEqual({
      format: "%c500%c %cNetwork tracing stopped",
      styles: ["color: #f44747; font-weight: bold", "", "color: #6a9955"],
    });
  });

  it("[NET-OUTPUT-008] preserves an empty token sequence", () => {
    expect(
      renderEventTokensForDevTools([], defaultNetworkTheme, "light"),
    ).toEqual({ format: "", styles: [] });
  });
});
