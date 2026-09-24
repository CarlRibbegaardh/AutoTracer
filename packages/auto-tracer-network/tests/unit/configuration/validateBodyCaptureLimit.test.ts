import { describe, expect, it } from "vitest";
import { validateBodyCaptureLimit } from "../../../src/configuration/validateBodyCaptureLimit";

describe("validateBodyCaptureLimit", () => {
  it("[NET-CONFIG-014] returns a positive integer unchanged", () => {
    expect(validateBodyCaptureLimit(65_536)).toBe(65_536);
  });

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    "[NET-CONFIG-014] rejects the invalid numeric value %s instead of clamping it",
    (value) => {
      expect(() => validateBodyCaptureLimit(value)).toThrow(
        "NetworkTracer: bodyCaptureLimit must be a positive integer",
      );
    },
  );

  it.each(["65536", null, true])(
    "[NET-CONFIG-014] rejects the invalid value %s without coercion",
    (value) => {
      expect(() => validateBodyCaptureLimit(value)).toThrow(
        "NetworkTracer: bodyCaptureLimit must be a positive integer",
      );
    },
  );
});
