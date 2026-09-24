import { describe, expect, it } from "vitest";
import { createXhrResponseHeadersDetailEvent } from "../../../src/capture/createXhrResponseHeadersDetailEvent";

describe("createXhrResponseHeadersDetailEvent", () => {
  it("[NET-EVENT-009][NET-CAPTURE-005][NET-REDACT-001..003][NET-OUTPUT-005] creates a detached redacted XHR response-header detail", () => {
    const headers = new Headers({
      "Set-Session-Token": "secret",
      "X-Visible": "initial",
    });

    const event = createXhrResponseHeadersDetailEvent(30, headers, ["*token*"]);
    headers.set("X-Visible", "changed");

    expect(event).toEqual({
      kind: "structured-detail",
      tokens: [
        { role: "identity", text: "Network #30" },
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
