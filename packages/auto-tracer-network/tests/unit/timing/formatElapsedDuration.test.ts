import { describe, expect, it } from "vitest";
import { formatElapsedDuration } from "../../../src/timing/formatElapsedDuration";

describe("formatElapsedDuration", () => {
  it("[NET-EVENT-008] uses milliseconds below 1000 milliseconds", () => {
    expect(formatElapsedDuration(0)).toBe("0 ms");
    expect(formatElapsedDuration(999)).toBe("999 ms");
  });

  it("[NET-EVENT-008] uses seconds to two decimal places at 1000 milliseconds", () => {
    expect(formatElapsedDuration(1000)).toBe("1.00 s");
    expect(formatElapsedDuration(1250)).toBe("1.25 s");
  });
});
