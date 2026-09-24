// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { createXhrRequestBodyDetailEvent } from "../../../src/capture/createXhrRequestBodyDetailEvent";

describe("createXhrRequestBodyDetailEvent", () => {
  it("[NET-BODY-004][NET-REDACT-001..003] reuses body capture for an XHR body value", () => {
    expect(
      createXhrRequestBodyDetailEvent(
        21,
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
        { role: "identity", text: "Network #21" },
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

  it("[NET-BODY-009] represents an XHR Document body without reading or serializing it", () => {
    const body = document.implementation.createDocument(
      "https://example.test/schema",
      "order",
    );

    expect(
      createXhrRequestBodyDetailEvent(22, body, {
        contentType: "application/xml",
        bodyCaptureLimit: 64,
        redactionPatterns: [],
      }),
    ).toEqual({
      kind: "structured-detail",
      tokens: [
        { role: "identity", text: "Network #22" },
        { role: "plain", text: "   " },
        { role: "label", text: "request body" },
        { role: "plain", text: ": " },
      ],
      value: {
        status: "metadata-only",
        contentType: "application/xml",
        knownByteSize: null,
      },
    });
  });
});
