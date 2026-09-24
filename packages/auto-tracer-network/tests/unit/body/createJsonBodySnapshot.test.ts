import { describe, expect, it } from "vitest";
import { createJsonBodySnapshot } from "../../../src/body/createJsonBodySnapshot";

describe("createJsonBodySnapshot", () => {
  it("[NET-BODY-004][NET-REDACT-001..003] parses and recursively redacts valid JSON", () => {
    expect(
      createJsonBodySnapshot(
        '{"profile":{"accessToken":"secret","name":"Ada"}}',
        ["*token*"],
      ),
    ).toEqual({
      status: "parsed",
      value: {
        profile: {
          accessToken: "[REDACTED]",
          name: "Ada",
        },
      },
    });
  });

  it("[NET-BODY-013][NET-BODY-014][NET-REDACT-006] preserves malformed JSON without field redaction", () => {
    expect(
      createJsonBodySnapshot('{"accessToken":"secret"', ["*token*"]),
    ).toEqual({
      status: "invalid-json",
      rawText: '{"accessToken":"secret"',
      fieldRedactionApplied: false,
    });
  });
});
