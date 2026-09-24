import { describe, expect, it } from "vitest";
import { isRedactionNameMatched } from "../../../src/redaction/isRedactionNameMatched";

describe("isRedactionNameMatched", () => {
  it("[NET-REDACT-001] matches exact names case-insensitively", () => {
    expect(isRedactionNameMatched("Authorization", ["authorization"])).toBe(
      true,
    );
    expect(isRedactionNameMatched("COOKIE", ["cookie"])).toBe(true);
  });

  it("[NET-REDACT-001] matches glob names case-insensitively", () => {
    expect(isRedactionNameMatched("RefreshToken", ["*token*"])).toBe(true);
    expect(
      isRedactionNameMatched("PRIMARY-X-API-KEY-VALUE", ["*x-api-key*"]),
    ).toBe(true);
  });

  it("[NET-REDACT-001] does not match names outside the pattern list", () => {
    expect(isRedactionNameMatched("displayName", ["*token*"])).toBe(false);
  });
});
