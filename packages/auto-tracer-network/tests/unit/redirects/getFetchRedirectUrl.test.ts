import { describe, expect, it } from "vitest";
import { getFetchRedirectUrl } from "../../../src/redirects/getFetchRedirectUrl";

describe("getFetchRedirectUrl", () => {
  it("[NET-URL-006] returns the browser-exposed final URL for a redirected response", () => {
    expect(
      getFetchRedirectUrl(true, "https://auth.example.test/account"),
    ).toBe("https://auth.example.test/account");
  });

  it("[NET-URL-006] reports no redirect when the browser redirect signal is false", () => {
    expect(
      getFetchRedirectUrl(false, "https://api.example.test/account"),
    ).toBeUndefined();
  });
});
