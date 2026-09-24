import { describe, expect, it } from "vitest";
import { redactHeaders } from "../../../src/redaction/redactHeaders";

describe("redactHeaders", () => {
  it("[NET-REDACT-001][NET-REDACT-003] redacts values by header name using shared patterns", () => {
    const headers = new Headers([
      ["Authorization", "Bearer credential"],
      ["X-Access-Token", "token credential"],
      ["X-Display-Name", "Ada"],
    ]);

    const redacted = redactHeaders(headers, ["authorization", "*token*"]);

    expect(redacted.get("Authorization")).toBe("[REDACTED]");
    expect(redacted.get("X-Access-Token")).toBe("[REDACTED]");
    expect(redacted.get("X-Display-Name")).toBe("Ada");
  });

  it("[NET-OUTPUT-005] returns a detached header snapshot", () => {
    const headers = new Headers({ Authorization: "Bearer credential" });

    const redacted = redactHeaders(headers, ["authorization"]);
    headers.set("Authorization", "changed credential");

    expect(redacted.get("Authorization")).toBe("[REDACTED]");
  });
});
