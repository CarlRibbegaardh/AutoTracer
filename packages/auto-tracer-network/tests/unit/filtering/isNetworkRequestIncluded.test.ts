import { describe, expect, it } from "vitest";
import { isNetworkRequestIncluded } from "../../../src/filtering/isNetworkRequestIncluded";

describe("isNetworkRequestIncluded", () => {
  it("[NET-FILTER-002] includes an absolute URL matching an exact include string", () => {
    expect(
      isNetworkRequestIncluded(
        "https://api.example.test/orders",
        ["https://api.example.test/orders"],
        []
      )
    ).toBe(true);
  });

  it("[NET-FILTER-002] includes an absolute URL matching an include glob string", () => {
    expect(
      isNetworkRequestIncluded(
        "https://api.example.test/orders/42",
        ["https://api.example.test/orders/*"],
        []
      )
    ).toBe(true);
  });

  it("[NET-FILTER-002] includes every URL when no include strings are configured", () => {
    expect(
      isNetworkRequestIncluded(
        "https://api.example.test/orders",
        [],
        []
      )
    ).toBe(true);
  });

  it("[NET-FILTER-002] excludes a URL that does not match a configured include string", () => {
    expect(
      isNetworkRequestIncluded(
        "https://api.example.test/profile",
        ["https://api.example.test/orders/*"],
        []
      )
    ).toBe(false);
  });

  it("[NET-FILTER-004] gives an exact exclusion precedence over inclusion", () => {
    expect(
      isNetworkRequestIncluded(
        "https://api.example.test/orders/private",
        ["https://api.example.test/orders/*"],
        ["https://api.example.test/orders/private"]
      )
    ).toBe(false);
  });

  it("[NET-FILTER-002][NET-FILTER-004] gives a glob exclusion precedence over inclusion", () => {
    expect(
      isNetworkRequestIncluded(
        "https://api.example.test/orders/private/42",
        ["https://api.example.test/orders/*"],
        ["https://api.example.test/orders/private/*"]
      )
    ).toBe(false);
  });
});
