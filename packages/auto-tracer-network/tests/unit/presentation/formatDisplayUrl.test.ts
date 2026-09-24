import { describe, expect, it } from "vitest";
import { formatDisplayUrl } from "../../../src/presentation/formatDisplayUrl";

describe("formatDisplayUrl", () => {
  it("[NET-URL-008] omits the origin from a same-origin URL and retains its query", () => {
    expect(
      formatDisplayUrl(
        "https://app.example.test/api/orders?status=open",
        "https://app.example.test/dashboard"
      )
    ).toBe("/api/orders?status=open");
  });

  it("[NET-URL-009] retains an absolute cross-origin URL and its query", () => {
    expect(
      formatDisplayUrl(
        "https://api.example.test/orders?status=open",
        "https://app.example.test/dashboard"
      )
    ).toBe("https://api.example.test/orders?status=open");
  });

  it("[NET-URL-010] leaves unmatched query parameter values visible", () => {
    expect(
      formatDisplayUrl(
        "https://app.example.test/api/orders?status=open",
        "https://app.example.test/dashboard",
        ["*token*"]
      )
    ).toBe("/api/orders?status=open");
  });

  it("[NET-URL-010] redacts values whose query parameter names match", () => {
    expect(
      formatDisplayUrl(
        "https://app.example.test/api/orders?AccessToken=secret&status=open",
        "https://app.example.test/dashboard",
        ["*token*"]
      )
    ).toBe("/api/orders?AccessToken=[REDACTED]&status=open");
  });
});
