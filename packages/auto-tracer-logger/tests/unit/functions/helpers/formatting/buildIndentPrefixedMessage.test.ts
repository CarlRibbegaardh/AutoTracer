import { describe, expect, it } from "vitest";

import { buildIndentPrefixedMessage } from "../../../../../src/lib/functions/helpers/formatting/buildIndentPrefixedMessage";

describe("buildIndentPrefixedMessage", () => {
  it("should apply indent then prefix on a single line", () => {
    const result = buildIndentPrefixedMessage("│  ", "[LOG]", "hello");
    expect(result).toBe("│  [LOG] hello");
  });

  it("should apply indent then prefix on each line", () => {
    const result = buildIndentPrefixedMessage("│  ", "[LOG]", "a\nb");
    expect(result).toBe("│  [LOG] a\n│  [LOG] b");
  });

  it("should apply prefix even when indent is empty", () => {
    const result = buildIndentPrefixedMessage("", "[LOG]", "hello");
    expect(result).toBe("[LOG] hello");
  });
});
