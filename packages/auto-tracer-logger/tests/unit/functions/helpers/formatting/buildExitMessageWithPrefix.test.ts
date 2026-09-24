import { describe, expect, it } from "vitest";
import { buildExitMessageWithPrefix } from "../../../../../src/lib/functions/helpers/formatting/buildExitMessageWithPrefix";

describe("buildExitMessageWithPrefix", () => {
  it("should build message with prefix when prefix is provided", () => {
    const result = buildExitMessageWithPrefix("myFunc (elapsed: 10.5ms)", "←");

    expect(result).toBe("← myFunc (elapsed: 10.5ms)");
  });

  it("should return elapsed message without prefix when prefix is empty", () => {
    const result = buildExitMessageWithPrefix("myFunc (elapsed: 10.5ms)", "");

    expect(result).toBe("myFunc (elapsed: 10.5ms)");
  });

  it("should handle empty elapsed message", () => {
    const result = buildExitMessageWithPrefix("", "←");

    expect(result).toBe("← ");
  });

  it("should handle both empty prefix and message", () => {
    const result = buildExitMessageWithPrefix("", "");

    expect(result).toBe("");
  });

  it("should preserve whitespace in prefix", () => {
    const result = buildExitMessageWithPrefix("test", "  ← ");

    expect(result).toBe("  ←  test");
  });

  it("should handle multi-word elapsed messages", () => {
    const result = buildExitMessageWithPrefix(
      "complex operation (elapsed: 150.25ms)",
      "EXIT:"
    );

    expect(result).toBe("EXIT: complex operation (elapsed: 150.25ms)");
  });

  it("should handle special characters in elapsed message", () => {
    const result = buildExitMessageWithPrefix(
      "test<>@#$ (elapsed: 5.00ms)",
      "→"
    );

    expect(result).toBe("→ test<>@#$ (elapsed: 5.00ms)");
  });
});
