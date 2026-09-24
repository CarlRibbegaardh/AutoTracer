import { describe, expect, it } from "vitest";
import { getEffectiveFetchMethod } from "../../../src/transport/getEffectiveFetchMethod";

describe("getEffectiveFetchMethod", () => {
  it("[NET-EVENT-001] gives RequestInit method precedence over Request method", () => {
    const request = new Request("https://example.test/api", {
      method: "post",
    });

    expect(getEffectiveFetchMethod(request, { method: "put" })).toBe("PUT");
  });

  it("[NET-EVENT-001] uses the Request method when RequestInit omits it", () => {
    const request = new Request("https://example.test/api", {
      method: "post",
    });

    expect(getEffectiveFetchMethod(request)).toBe("POST");
  });

  it("[NET-EVENT-001] defaults string and URL inputs to GET", () => {
    expect(getEffectiveFetchMethod("/api/orders")).toBe("GET");
    expect(getEffectiveFetchMethod(new URL("https://example.test/api"))).toBe(
      "GET",
    );
  });

  it("[NET-EVENT-001] preserves extension-method casing", () => {
    expect(
      getEffectiveFetchMethod("/api/search", { method: "m-search" }),
    ).toBe("m-search");
  });
});
