import { describe, expect, it } from "vitest";
import { createRedirectCompletionEvent } from "../../../src/events/createRedirectCompletionEvent";
import { createDevToolsRedirectArguments } from "../../../src/output/createDevToolsRedirectArguments";
import { defaultNetworkTheme } from "../../../src/theme/defaultNetworkTheme";

describe("createDevToolsRedirectArguments", () => {
  it("[NET-URL-001..004][NET-OUTPUT-007..008] creates one styled multiline argument set", () => {
    const event = createRedirectCompletionEvent({
      requestId: 13,
      status: 200,
      method: "GET",
      requestedUrl: "/api/account",
      finalUrl: "https://auth.example.com/account",
      elapsedMilliseconds: 180,
    });

    expect(
      createDevToolsRedirectArguments(event, defaultNetworkTheme, "dark"),
    ).toEqual([
      "%cNetwork #13%c <- %c200%c %cREDIRECTED%c (%c180 ms%c)\n%c  %crequested%c: %cGET%c %c/api/account\n%c  %cfinal%c:     %chttps://auth.example.com/account",
      "color: #569cd6; font-weight: bold",
      "",
      "",
      "",
      "color: #d7ba7d; font-weight: bold",
      "",
      "",
      "",
      "",
      "color: #4ec9b0",
      "",
      "color: #dcdcaa",
      "",
      "",
      "",
      "color: #4ec9b0",
      "",
      "",
    ]);
  });
});
