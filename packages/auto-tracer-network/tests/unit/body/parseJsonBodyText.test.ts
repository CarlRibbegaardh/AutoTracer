import { describe, expect, it } from "vitest";
import { parseJsonBodyText } from "../../../src/body/parseJsonBodyText";

describe("parseJsonBodyText", () => {
  it("[NET-BODY-004] parses valid JSON structurally", () => {
    expect(parseJsonBodyText('{"status":201,"tags":["trace"]}')).toEqual({
      status: "parsed",
      value: { status: 201, tags: ["trace"] },
    });
  });

  it("[NET-BODY-013][NET-BODY-014][NET-REDACT-006] preserves malformed JSON with its redaction limitation", () => {
    expect(parseJsonBodyText('{"accessToken":"secret"')).toEqual({
      status: "invalid-json",
      rawText: '{"accessToken":"secret"',
      fieldRedactionApplied: false,
    });
  });
});
