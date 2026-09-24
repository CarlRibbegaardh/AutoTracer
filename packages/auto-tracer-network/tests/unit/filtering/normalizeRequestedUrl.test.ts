import { describe, expect, it } from "vitest";
import { normalizeRequestedUrl } from "../../../src/filtering/normalizeRequestedUrl";

describe("normalizeRequestedUrl", () => {
  it("[NET-FILTER-001] resolves a relative requested URL against the main-window URL", () => {
    expect(
      normalizeRequestedUrl(
        "/api/orders?status=open",
        "https://app.example.test/dashboard"
      )
    ).toBe("https://app.example.test/api/orders?status=open");
  });

  it("[NET-FILTER-001] preserves an absolute requested URL", () => {
    expect(
      normalizeRequestedUrl(
        "https://api.example.test/orders?status=open",
        "https://app.example.test/dashboard"
      )
    ).toBe("https://api.example.test/orders?status=open");
  });
});
