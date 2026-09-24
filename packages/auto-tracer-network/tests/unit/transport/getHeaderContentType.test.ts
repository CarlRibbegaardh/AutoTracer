import { describe, expect, it } from "vitest";
import { getHeaderContentType } from "../../../src/transport/getHeaderContentType";

describe("getHeaderContentType", () => {
  it("[NET-BODY-004..009] reads content type case-insensitively", () => {
    expect(
      getHeaderContentType(
        new Headers({ "Content-Type": "application/problem+json" }),
      ),
    ).toBe("application/problem+json");
  });

  it("returns null when content type is unavailable", () => {
    expect(getHeaderContentType(new Headers())).toBeNull();
  });
});
