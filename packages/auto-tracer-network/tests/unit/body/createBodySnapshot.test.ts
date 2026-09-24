import { describe, expect, it } from "vitest";
import { createBodySnapshot } from "../../../src/body/createBodySnapshot";

describe("createBodySnapshot", () => {
  it("[NET-BODY-004] routes string bodies through text and JSON policy", () => {
    expect(
      createBodySnapshot({
        body: '{"status":"ok"}',
        contentType: "application/json",
        captureLimit: 64,
        redactionPatterns: [],
      }),
    ).toEqual({ status: "parsed", value: { status: "ok" } });
  });

  it("[NET-BODY-006] routes platform bodies through non-text policy", () => {
    expect(
      createBodySnapshot({
        body: new URLSearchParams({ status: "ok" }),
        contentType: "application/x-www-form-urlencoded",
        captureLimit: 64,
        redactionPatterns: [],
      }),
    ).toEqual({
      status: "captured",
      text: "status=ok",
      originalByteSize: 9,
      capturedByteSize: 9,
      truncated: false,
    });
  });
});
