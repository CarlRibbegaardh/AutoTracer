import { describe, expect, it } from "vitest";
import { getFetchRequestedUrl } from "../../../src/transport/getFetchRequestedUrl";

describe("getFetchRequestedUrl", () => {
  it("[NET-FILTER-001][NET-URL-004] reads the requested URL from every fetch input form", () => {
    expect(getFetchRequestedUrl("/api/orders")).toBe("/api/orders");
    expect(getFetchRequestedUrl(new URL("https://example.test/api"))).toBe(
      "https://example.test/api",
    );
    expect(
      getFetchRequestedUrl(new Request("https://example.test/request")),
    ).toBe("https://example.test/request");
  });
});
