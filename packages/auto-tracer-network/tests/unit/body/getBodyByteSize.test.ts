import { describe, expect, it } from "vitest";
import { getBodyByteSize } from "../../../src/body/getBodyByteSize";

describe("getBodyByteSize", () => {
  it("[NET-BODY-009] returns browser-visible Blob and buffer sizes", () => {
    expect(getBodyByteSize(new Blob(["abc"]))).toBe(3);
    expect(getBodyByteSize(new ArrayBuffer(8))).toBe(8);
    expect(getBodyByteSize(new Uint8Array(new ArrayBuffer(8), 2, 3))).toBe(3);
  });

  it("[NET-BODY-009] returns null when no binary size is exposed", () => {
    expect(getBodyByteSize(new ReadableStream<Uint8Array>())).toBeNull();
  });
});
