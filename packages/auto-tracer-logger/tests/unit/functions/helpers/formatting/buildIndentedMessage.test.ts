import { describe, expect, it } from "vitest";

import { buildIndentedMessage } from "../../../../../src/lib/functions/helpers/formatting/buildIndentedMessage";

describe("buildIndentedMessage", () => {
  it("should indent a single-line message", () => {
    const result = buildIndentedMessage("│  ", "hello");
    expect(result).toBe("│  hello");
  });

  it("should indent each line in a multi-line message", () => {
    const result = buildIndentedMessage("│  ", "a\nb");
    expect(result).toBe("│  a\n│  b");
  });

  it("should return original message when indent is empty", () => {
    const result = buildIndentedMessage("", "a\nb");
    expect(result).toBe("a\nb");
  });
});
