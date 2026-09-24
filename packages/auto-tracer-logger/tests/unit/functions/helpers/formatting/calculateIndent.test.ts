import { describe, expect, it } from "vitest";
import { calculateGroupIndent } from "../../../../../src/lib/functions/helpers/formatting/calculateGroupIndent";
import { calculateExitIndent } from "../../../../../src/lib/functions/helpers/formatting/calculateExitIndent";

describe("calculateGroupIndent", () => {
  it("should return empty string at depth 0", () => {
    const result = calculateGroupIndent(0);
    expect(result).toBe("");
  });

  it("should return single indent marker at depth 1", () => {
    const result = calculateGroupIndent(1);
    expect(result).toBe("│  ");
  });

  it("should return double indent marker at depth 2", () => {
    const result = calculateGroupIndent(2);
    expect(result).toBe("│  │  ");
  });

  it("should return triple indent marker at depth 3", () => {
    const result = calculateGroupIndent(3);
    expect(result).toBe("│  │  │  ");
  });

  it("should handle depth 10", () => {
    const result = calculateGroupIndent(10);
    expect(result).toBe("│  ".repeat(10));
  });
});

describe("calculateExitIndent", () => {
  it("should return empty string at depth 0", () => {
    const result = calculateExitIndent(0);
    expect(result).toBe("");
  });

  it("should return empty string at depth 1", () => {
    const result = calculateExitIndent(1);
    expect(result).toBe("");
  });

  it("should return single indent marker at depth 2", () => {
    const result = calculateExitIndent(2);
    expect(result).toBe("│  ");
  });

  it("should return double indent marker at depth 3", () => {
    const result = calculateExitIndent(3);
    expect(result).toBe("│  │  ");
  });

  it("should return triple indent marker at depth 4", () => {
    const result = calculateExitIndent(4);
    expect(result).toBe("│  │  │  ");
  });

  it("should handle depth 10", () => {
    const result = calculateExitIndent(10);
    expect(result).toBe("│  ".repeat(9));
  });

  it("should guard against negative values", () => {
    const result = calculateExitIndent(-5);
    expect(result).toBe("");
  });
});
