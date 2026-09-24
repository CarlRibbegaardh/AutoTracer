import { describe, expect, it } from "vitest";
import { createUrlEncodedBodySnapshot } from "../../../src/body/createUrlEncodedBodySnapshot";

describe("createUrlEncodedBodySnapshot", () => {
  it("[NET-BODY-006] serializes URL-encoded data before capture", () => {
    expect(
      createUrlEncodedBodySnapshot(
        new URLSearchParams({ name: "Ada Lovelace" }),
        17,
      ),
    ).toEqual({
      status: "captured",
      text: "name=Ada+Lovelace",
      originalByteSize: 17,
      capturedByteSize: 17,
      truncated: false,
    });
  });

  it("[NET-BODY-011] applies the inclusive byte limit after serialization", () => {
    expect(
      createUrlEncodedBodySnapshot(
        new URLSearchParams({ status: "open" }),
        10,
      ),
    ).toEqual({
      status: "captured",
      text: "status=ope",
      originalByteSize: 11,
      capturedByteSize: 10,
      truncated: true,
    });
  });
});
