import { describe, expect, it } from "vitest";
import { resolveEventTokenThemeCategory } from "../../../src/theme/resolveEventTokenThemeCategory";

describe("resolveEventTokenThemeCategory", () => {
  it("[NET-OUTCOME-006..007][NET-OUTPUT-008] maps semantic token roles to theme categories", () => {
    expect(
      resolveEventTokenThemeCategory({ role: "identity", text: "Network #1" }),
    ).toBe("identity");
    expect(
      resolveEventTokenThemeCategory({ role: "method", text: "GET" }),
    ).toBe("method");
    expect(
      resolveEventTokenThemeCategory({ role: "label", text: "response body" }),
    ).toBe("detailLabel");
    expect(
      resolveEventTokenThemeCategory({ role: "outcome", text: "FAILED" }),
    ).toBe("error");
    expect(
      resolveEventTokenThemeCategory({ role: "unavailable", text: "UNAVAILABLE" }),
    ).toBe("error");
    expect(
      resolveEventTokenThemeCategory({ role: "redirect", text: "REDIRECTED" }),
    ).toBe("redirect");
    expect(
      resolveEventTokenThemeCategory({
        role: "runtime-control",
        text: "Network tracing started",
      }),
    ).toBe("runtimeControl");
  });

  it("[NET-OUTCOME-006] styles only HTTP error statuses", () => {
    expect(
      resolveEventTokenThemeCategory({ role: "status", text: "404" }),
    ).toBe("error");
    expect(
      resolveEventTokenThemeCategory({ role: "status", text: "200" }),
    ).toBeUndefined();
  });

  it("returns no category for supporting text", () => {
    expect(
      resolveEventTokenThemeCategory({ role: "url", text: "/api/orders" }),
    ).toBeUndefined();
  });
});
