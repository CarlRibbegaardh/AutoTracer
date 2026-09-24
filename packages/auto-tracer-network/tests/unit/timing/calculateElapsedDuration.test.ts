import { describe, expect, it } from "vitest";
import { calculateElapsedDuration } from "../../../src/timing/calculateElapsedDuration";

describe("calculateElapsedDuration", () => {
  it("[NET-EVENT-006] calculates elapsed monotonic milliseconds", () => {
    expect(calculateElapsedDuration(100, 184)).toBe(84);
  });

  it("[NET-EVENT-006] reports zero when start and completion markers match", () => {
    expect(calculateElapsedDuration(100, 100)).toBe(0);
  });
});
