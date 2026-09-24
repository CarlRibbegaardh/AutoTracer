import { describe, expect, it } from "vitest";
import { redactJsonFields } from "../../../src/redaction/redactJsonFields";

describe("redactJsonFields", () => {
  it("[NET-REDACT-002][NET-REDACT-003] recursively replaces matched field values", () => {
    const input = {
      authorization: "Bearer credential",
      profile: {
        displayName: "Ada",
        credentials: {
          refreshToken: "refresh credential",
        },
      },
      sessions: [
        { accessToken: "first credential" },
        { accessToken: "second credential" },
      ],
    };

    expect(
      redactJsonFields(input, ["authorization", "*token*"]),
    ).toEqual({
      authorization: "[REDACTED]",
      profile: {
        displayName: "Ada",
        credentials: {
          refreshToken: "[REDACTED]",
        },
      },
      sessions: [
        { accessToken: "[REDACTED]" },
        { accessToken: "[REDACTED]" },
      ],
    });
  });

  it("[NET-REDACT-001] applies field patterns case-insensitively", () => {
    expect(redactJsonFields({ PASSWORD: "credential" }, ["*password*"])).toEqual(
      { PASSWORD: "[REDACTED]" },
    );
  });

  it.each([null, true, 42, "visible"])(
    "preserves the JSON primitive %s",
    (value) => {
      expect(redactJsonFields(value, ["*secret*"])).toBe(value);
    },
  );

  it("returns an immutable snapshot without changing the input", () => {
    const input = {
      profile: {
        secret: "credential",
        displayName: "Ada",
      },
    };

    const result = redactJsonFields(input, ["secret"]);

    expect(input.profile.secret).toBe("credential");
    expect(result).not.toBe(input);
    expect(result).toEqual({
      profile: {
        secret: "[REDACTED]",
        displayName: "Ada",
      },
    });
  });
});
