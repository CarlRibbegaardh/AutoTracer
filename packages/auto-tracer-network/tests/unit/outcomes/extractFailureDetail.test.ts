import { describe, expect, it } from "vitest";
import { extractFailureDetail } from "../../../src/outcomes/extractFailureDetail";

describe("extractFailureDetail", () => {
  it("[NET-OUTCOME-008] extracts the native error name and message", () => {
    expect(extractFailureDetail(new TypeError("Invalid request"))).toEqual({
      name: "TypeError",
      message: "Invalid request",
    });
  });

  it("[NET-OUTCOME-009] excludes the native error stack", () => {
    const detail = extractFailureDetail(new Error("Request failed"));

    expect(detail).toEqual({ name: "Error", message: "Request failed" });
    expect(detail).not.toHaveProperty("stack");
  });
});
