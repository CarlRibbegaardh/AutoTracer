import { describe, expect, it } from "vitest";
import { validateAutoStopAfterRequests } from "../../../src/configuration/validateAutoStopAfterRequests";

describe("validateAutoStopAfterRequests", () => {
  it("[NET-AUTOSTOP-001][NET-CONFIG-014] returns a positive integer unchanged", () => {
    expect(validateAutoStopAfterRequests(25)).toBe(25);
  });

  it("[NET-AUTOSTOP-001] accepts undefined as the disabled value", () => {
    expect(validateAutoStopAfterRequests(undefined)).toBeUndefined();
  });

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    "[NET-CONFIG-014] rejects the invalid numeric value %s instead of clamping it",
    (value) => {
      expect(() => validateAutoStopAfterRequests(value)).toThrow(
        "NetworkTracer: autoStopAfterRequests must be a positive integer or undefined",
      );
    },
  );

  it.each(["25", null, false])(
    "[NET-CONFIG-014] rejects the invalid value %s without coercion",
    (value) => {
      expect(() => validateAutoStopAfterRequests(value)).toThrow(
        "NetworkTracer: autoStopAfterRequests must be a positive integer or undefined",
      );
    },
  );
});
