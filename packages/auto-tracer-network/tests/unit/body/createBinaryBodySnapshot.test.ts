import { describe, expect, it } from "vitest";
import { createBinaryBodySnapshot } from "../../../src/body/createBinaryBodySnapshot";

describe("createBinaryBodySnapshot", () => {
  it("[NET-BODY-009] captures only known binary metadata", () => {
    expect(createBinaryBodySnapshot("image/png", 1_024)).toEqual({
      status: "metadata-only",
      contentType: "image/png",
      knownByteSize: 1_024,
    });
  });

  it("[NET-BODY-009] represents unavailable binary metadata explicitly", () => {
    expect(createBinaryBodySnapshot(null, null)).toEqual({
      status: "metadata-only",
      contentType: null,
      knownByteSize: null,
    });
  });
});
