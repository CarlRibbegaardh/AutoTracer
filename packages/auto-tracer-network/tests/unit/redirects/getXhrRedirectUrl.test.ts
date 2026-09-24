import { describe, expect, it } from "vitest";
import { getXhrRedirectUrl } from "../../../src/redirects/getXhrRedirectUrl";

describe("getXhrRedirectUrl", () => {
  it("[NET-URL-007] returns a differing available response URL", () => {
    expect(
      getXhrRedirectUrl(
        "https://api.example.test/account",
        "https://auth.example.test/account",
      ),
    ).toBe("https://auth.example.test/account");
  });

  it("[NET-URL-007] reports no redirect when the response URL matches", () => {
    expect(
      getXhrRedirectUrl(
        "https://api.example.test/account",
        "https://api.example.test/account",
      ),
    ).toBeUndefined();
  });

  it("[NET-URL-007] reports no redirect when the response URL is unavailable", () => {
    expect(
      getXhrRedirectUrl("https://api.example.test/account", ""),
    ).toBeUndefined();
  });
});
