import { describe, expect, it } from "vitest";
import { buildEnterMessageWithPrefix } from "../../../../../src/lib/functions/helpers/formatting/buildEnterMessageWithPrefix";

describe("buildEnterMessageWithPrefix", () => {
  it("should build message with prefix when prefix is provided", () => {
    const result = buildEnterMessageWithPrefix("myFunc", "→");

    expect(result).toBe("→ myFunc");
  });

  it("should return label without prefix when prefix is empty", () => {
    const result = buildEnterMessageWithPrefix("myFunc", "");

    expect(result).toBe("myFunc");
  });

  it("should handle empty label", () => {
    const result = buildEnterMessageWithPrefix("", "→");

    expect(result).toBe("→ ");
  });

  it("should handle both empty prefix and label", () => {
    const result = buildEnterMessageWithPrefix("", "");

    expect(result).toBe("");
  });

  it("should preserve whitespace in prefix", () => {
    const result = buildEnterMessageWithPrefix("test", "  → ");

    expect(result).toBe("  →  test");
  });

  it("should handle complex labels", () => {
    const result = buildEnterMessageWithPrefix(
      "complex.operation.with.dots",
      "ENTER:"
    );

    expect(result).toBe("ENTER: complex.operation.with.dots");
  });

  it("should handle special characters in label", () => {
    const result = buildEnterMessageWithPrefix("test<>@#$", "►");

    expect(result).toBe("► test<>@#$");
  });
});
