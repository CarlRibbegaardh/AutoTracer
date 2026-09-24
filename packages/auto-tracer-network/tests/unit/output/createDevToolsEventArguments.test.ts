import { describe, expect, it } from "vitest";
import { createRequestStartEvent } from "../../../src/events/createRequestStartEvent";
import { createDevToolsEventArguments } from "../../../src/output/createDevToolsEventArguments";
import { defaultNetworkTheme } from "../../../src/theme/defaultNetworkTheme";

describe("createDevToolsEventArguments", () => {
  it("[NET-EVENT-001][NET-OUTPUT-007..008] creates aligned styled arguments for a token event", () => {
    const event = createRequestStartEvent(7, "GET", "/api/orders");

    expect(
      createDevToolsEventArguments(event, defaultNetworkTheme, "dark"),
    ).toEqual([
      "%cNetwork #7%c -> %cGET%c %c/api/orders",
      "color: #569cd6; font-weight: bold",
      "",
      "color: #dcdcaa",
      "",
      "",
    ]);
  });
});
