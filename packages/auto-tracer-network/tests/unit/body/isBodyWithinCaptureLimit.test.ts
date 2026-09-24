import { describe, expect, it } from "vitest";
import { isBodyWithinCaptureLimit } from "../../../src/body/isBodyWithinCaptureLimit";

describe("isBodyWithinCaptureLimit", () => {
  it("[NET-BODY-004][NET-BODY-005] accepts bodies within the configured limit", () => {
    expect(isBodyWithinCaptureLimit(1_023, 1_024)).toBe(true);
    expect(isBodyWithinCaptureLimit(1_024, 1_024)).toBe(true);
  });

  it("[NET-BODY-011][NET-BODY-012] identifies a body over the configured limit", () => {
    expect(isBodyWithinCaptureLimit(1_025, 1_024)).toBe(false);
  });
});
