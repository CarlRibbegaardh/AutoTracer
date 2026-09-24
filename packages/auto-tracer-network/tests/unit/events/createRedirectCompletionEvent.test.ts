import { describe, expect, it } from "vitest";
import { createRedirectCompletionEvent } from "../../../src/events/createRedirectCompletionEvent";

describe("createRedirectCompletionEvent", () => {
  it("[NET-URL-001..004] creates one multiline redirected completion event", () => {
    expect(
      createRedirectCompletionEvent({
        requestId: 13,
        status: 200,
        method: "GET",
        requestedUrl: "/api/account",
        finalUrl: "https://auth.example.com/account",
        elapsedMilliseconds: 180,
      }),
    ).toEqual({
      kind: "redirect-completion",
      completionTokens: [
        { role: "identity", text: "Network #13" },
        { role: "direction", text: " <- " },
        { role: "status", text: "200" },
        { role: "plain", text: " " },
        { role: "redirect", text: "REDIRECTED" },
        { role: "plain", text: " (" },
        { role: "duration", text: "180 ms" },
        { role: "plain", text: ")" },
      ],
      requestedTokens: [
        { role: "plain", text: "  " },
        { role: "label", text: "requested" },
        { role: "plain", text: ": " },
        { role: "method", text: "GET" },
        { role: "plain", text: " " },
        { role: "url", text: "/api/account" },
      ],
      finalTokens: [
        { role: "plain", text: "  " },
        { role: "label", text: "final" },
        { role: "plain", text: ":     " },
        { role: "url", text: "https://auth.example.com/account" },
      ],
    });
  });
});
