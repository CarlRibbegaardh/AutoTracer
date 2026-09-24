import { describe, expect, it } from "vitest";
import { createRedirectCompletionEvent } from "../../../src/events/createRedirectCompletionEvent";
import { createCopyPasteRedirectArguments } from "../../../src/output/createCopyPasteRedirectArguments";

describe("createCopyPasteRedirectArguments", () => {
  it("[NET-URL-001..004][NET-OUTPUT-004,006] creates one plain multiline argument", () => {
    const event = createRedirectCompletionEvent({
      requestId: 13,
      status: 200,
      method: "GET",
      requestedUrl: "/api/account",
      finalUrl: "https://auth.example.com/account",
      elapsedMilliseconds: 180,
    });

    expect(createCopyPasteRedirectArguments(event)).toEqual([
      "Network #13 <- 200 REDIRECTED (180 ms)\n  requested: GET /api/account\n  final:     https://auth.example.com/account",
    ]);
  });
});
