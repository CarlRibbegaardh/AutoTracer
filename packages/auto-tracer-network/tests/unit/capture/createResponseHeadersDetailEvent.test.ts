import { describe, expect, it } from "vitest";
import { createResponseHeadersDetailEvent } from "../../../src/capture/createResponseHeadersDetailEvent";

describe("createResponseHeadersDetailEvent", () => {
  it("[NET-EVENT-009][NET-CAPTURE-005][NET-REDACT-001..003][NET-OUTPUT-005] creates a detached redacted browser-visible response-header detail", () => {
    const response = new Response(null, {
      headers: {
        "Set-Session-Token": "secret",
        "X-Visible": "initial",
      },
    });

    const event = createResponseHeadersDetailEvent(13, response, ["*token*"]);
    response.headers.set("X-Visible", "changed");

    expect(event).toEqual({
      kind: "structured-detail",
      tokens: [
        { role: "identity", text: "Network #13" },
        { role: "plain", text: "   " },
        { role: "label", text: "response headers" },
        { role: "plain", text: ": " },
      ],
      value: {
        "set-session-token": "[REDACTED]",
        "x-visible": "initial",
      },
    });
  });
});
