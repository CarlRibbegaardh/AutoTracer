import { describe, expect, it } from "vitest";
import { createTextBodySnapshot } from "../../../src/body/createTextBodySnapshot";

describe("createTextBodySnapshot", () => {
  it("[NET-BODY-004][NET-REDACT-001..003] parses and redacts JSON within the inclusive limit", () => {
    const text = '{"accessToken":"secret","visible":true}';

    expect(
      createTextBodySnapshot({
        text,
        contentType: "application/json",
        captureLimit: new TextEncoder().encode(text).byteLength,
        redactionPatterns: ["*token*"],
      }),
    ).toEqual({
      status: "parsed",
      value: { accessToken: "[REDACTED]", visible: true },
    });
  });

  it("[NET-BODY-012] returns metadata instead of partial oversized JSON", () => {
    expect(
      createTextBodySnapshot({
        text: '{"value":123}',
        contentType: "application/problem+json",
        captureLimit: 5,
        redactionPatterns: [],
      }),
    ).toEqual({
      status: "exceeds-limit",
      contentType: "application/problem+json",
      byteSize: 13,
      reason: "JSON body exceeds capture limit",
    });
  });

  it("[NET-BODY-005,011] truncates plain text at a UTF-8 boundary", () => {
    expect(
      createTextBodySnapshot({
        text: "ABCDE",
        contentType: "text/plain",
        captureLimit: 3,
        redactionPatterns: [],
      }),
    ).toEqual({
      status: "captured",
      text: "ABC",
      originalByteSize: 5,
      capturedByteSize: 3,
      truncated: true,
    });
  });
});
