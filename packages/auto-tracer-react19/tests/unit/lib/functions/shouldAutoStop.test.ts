import { describe, expect, it } from "vitest";
import { shouldAutoStop } from "@src/lib/functions/shouldAutoStop.js";

describe("shouldAutoStop", () => {
  it("should return true when transitioning from enabled to disabled while active", () => {
    const result = shouldAutoStop(true, false, true);
    expect(result).toBe(true);
  });

  it("should return false when already disabled", () => {
    const result = shouldAutoStop(false, false, true);
    expect(result).toBe(false);
  });

  it("should return false when not active", () => {
    const result = shouldAutoStop(true, false, false);
    expect(result).toBe(false);
  });

  it("should return false when enabling", () => {
    const result = shouldAutoStop(false, true, true);
    expect(result).toBe(false);
  });

  it("should return false when remaining enabled", () => {
    const result = shouldAutoStop(true, true, true);
    expect(result).toBe(false);
  });

  it("should return false when prevEnabled is undefined", () => {
    const result = shouldAutoStop(undefined, false, true);
    expect(result).toBe(false);
  });

  it("should return false when newEnabled is undefined", () => {
    const result = shouldAutoStop(true, undefined, true);
    expect(result).toBe(false);
  });

  it("should handle all undefined inputs", () => {
    const result = shouldAutoStop(undefined, undefined, true);
    expect(result).toBe(false);
  });
});
