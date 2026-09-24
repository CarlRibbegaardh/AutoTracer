import { describe, expect, it } from "vitest";
import { normalizeHttpMethod } from "../../../src/transport/normalizeHttpMethod";

describe("normalizeHttpMethod", () => {
  it("[NET-EVENT-001][NET-XHR-002] uppercases browser-standard methods", () => {
    expect(normalizeHttpMethod("get")).toBe("GET");
    expect(normalizeHttpMethod("post")).toBe("POST");
    expect(normalizeHttpMethod("delete")).toBe("DELETE");
  });

  it("[NET-EVENT-001][NET-XHR-002] preserves extension-method casing", () => {
    expect(normalizeHttpMethod("m-search")).toBe("m-search");
  });
});
