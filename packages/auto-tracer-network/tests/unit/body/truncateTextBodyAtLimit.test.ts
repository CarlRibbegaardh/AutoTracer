import { describe, expect, it } from "vitest";
import { truncateTextBodyAtLimit } from "../../../src/body/truncateTextBodyAtLimit";

describe("truncateTextBodyAtLimit", () => {
  it("[NET-BODY-005][NET-BODY-006] preserves text at the inclusive UTF-8 byte limit", () => {
    expect(truncateTextBodyAtLimit("café", 5)).toEqual({
      status: "captured",
      text: "café",
      originalByteSize: 5,
      capturedByteSize: 5,
      truncated: false,
    });
  });

  it("[NET-BODY-011] truncates oversized text at the longest valid Unicode prefix", () => {
    expect(truncateTextBodyAtLimit("A😀B", 4)).toEqual({
      status: "captured",
      text: "A",
      originalByteSize: 6,
      capturedByteSize: 1,
      truncated: true,
    });

    expect(truncateTextBodyAtLimit("A😀B", 5)).toEqual({
      status: "captured",
      text: "A😀",
      originalByteSize: 6,
      capturedByteSize: 5,
      truncated: true,
    });
  });
});
