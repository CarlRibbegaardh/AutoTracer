import { describe, expect, it } from "vitest";
import { createRequestHeadersDetailEvent } from "../../../src/capture/createRequestHeadersDetailEvent";

describe("createRequestHeadersDetailEvent", () => {
  it("[NET-EVENT-009][NET-CAPTURE-004][NET-REDACT-001..003][NET-OUTPUT-005] creates a detached redacted request-header detail", () => {
    const headers = new Headers({
      Authorization: "Bearer secret",
      "X-Client": "web",
    });

    const event = createRequestHeadersDetailEvent(12, headers, [
      "authorization",
    ]);
    headers.set("X-Client", "changed");

    expect(event).toEqual({
      kind: "structured-detail",
      tokens: [
        { role: "identity", text: "Network #12" },
        { role: "plain", text: "   " },
        { role: "label", text: "request headers" },
        { role: "plain", text: ": " },
      ],
      value: {
        authorization: "[REDACTED]",
        "x-client": "web",
      },
    });
  });
});
