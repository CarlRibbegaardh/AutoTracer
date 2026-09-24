import { describe, expect, it } from "vitest";
import { createRequestBodyDetailEvent } from "../../../src/capture/createRequestBodyDetailEvent";

describe("createRequestBodyDetailEvent", () => {
  it("[NET-EVENT-009][NET-BODY-004][NET-REDACT-001..003][NET-OUTPUT-005] creates a detached redacted request-body detail", () => {
    expect(
      createRequestBodyDetailEvent(
        12,
        '{"accessToken":"secret","visible":true}',
        {
          contentType: "application/json",
          bodyCaptureLimit: 64,
          redactionPatterns: ["*token*"],
        },
      ),
    ).toEqual({
      kind: "structured-detail",
      tokens: [
        { role: "identity", text: "Network #12" },
        { role: "plain", text: "   " },
        { role: "label", text: "request body" },
        { role: "plain", text: ": " },
      ],
      value: {
        status: "parsed",
        value: { accessToken: "[REDACTED]", visible: true },
      },
    });
  });
});
