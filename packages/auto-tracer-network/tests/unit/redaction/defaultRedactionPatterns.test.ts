import { describe, expect, it } from "vitest";
import { defaultRedactionPatterns } from "../../../src/redaction/defaultRedactionPatterns";

describe("defaultRedactionPatterns", () => {
  it("[NET-REDACT-004] contains the approved initial patterns", () => {
    expect(defaultRedactionPatterns).toEqual([
      "authorization",
      "cookie",
      "*token*",
      "*secret*",
      "*password*",
      "*signature*",
      "*x-api-key*",
    ]);
  });
});
