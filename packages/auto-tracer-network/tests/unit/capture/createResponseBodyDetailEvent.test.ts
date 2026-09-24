import { describe, expect, it } from "vitest";
import { createResponseBodyDetailEvent } from "../../../src/capture/createResponseBodyDetailEvent";

describe("createResponseBodyDetailEvent", () => {
  it("[NET-EVENT-009][NET-BODY-006,011][NET-OUTPUT-005] creates a detached response-body detail", () => {
    const body = new URLSearchParams({ status: "ready" });

    const event = createResponseBodyDetailEvent(13, body, {
      contentType: "application/x-www-form-urlencoded",
      bodyCaptureLimit: 8,
      redactionPatterns: [],
    });
    body.set("status", "changed");

    expect(event).toEqual({
      kind: "structured-detail",
      tokens: [
        { role: "identity", text: "Network #13" },
        { role: "plain", text: "   " },
        { role: "label", text: "response body" },
        { role: "plain", text: ": " },
      ],
      value: {
        status: "captured",
        text: "status=r",
        originalByteSize: 12,
        capturedByteSize: 8,
        truncated: true,
      },
    });
  });
});
