// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { createUnavailableDetailEvent } from "../../../src/events/createUnavailableDetailEvent";
import { createXhrResponseBodyDetailEvent } from "../../../src/capture/createXhrResponseBodyDetailEvent";

describe("createXhrResponseBodyDetailEvent", () => {
  it("[NET-BODY-004][NET-REDACT-001..003] captures a text XHR response through the shared body model", () => {
    expect(
      createXhrResponseBodyDetailEvent(
        33,
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
        { role: "identity", text: "Network #33" },
        { role: "plain", text: "   " },
        { role: "label", text: "response body" },
        { role: "plain", text: ": " },
      ],
      value: {
        status: "parsed",
        value: { accessToken: "[REDACTED]", visible: true },
      },
    });
  });

  it("[NET-BODY-009] captures XHR binary response metadata", () => {
    expect(
      createXhrResponseBodyDetailEvent(34, new ArrayBuffer(12), {
        contentType: "application/octet-stream",
        bodyCaptureLimit: 64,
        redactionPatterns: [],
      }),
    ).toMatchObject({
      kind: "structured-detail",
      value: {
        status: "metadata-only",
        contentType: "application/octet-stream",
        knownByteSize: 12,
      },
    });
  });

  it("[NET-BODY-009] represents an XHR Document response without serializing it", () => {
    const response = document.implementation.createDocument(
      "https://example.test/schema",
      "order",
    );

    expect(
      createXhrResponseBodyDetailEvent(35, response, {
        contentType: "application/xml",
        bodyCaptureLimit: 64,
        redactionPatterns: [],
      }),
    ).toMatchObject({
      kind: "structured-detail",
      value: {
        status: "metadata-only",
        contentType: "application/xml",
        knownByteSize: null,
      },
    });
  });

  it("[NET-CAPTURE-012] reports an unsupported XHR response value as unavailable", () => {
    expect(
      createXhrResponseBodyDetailEvent(
        36,
        { accessToken: "cannot-measure-original-size" },
        {
          contentType: "application/json",
          bodyCaptureLimit: 64,
          redactionPatterns: ["*token*"],
        },
      ),
    ).toEqual(createUnavailableDetailEvent(36, "response body"));
  });
});
