import { describe, it, expect } from "vitest";
import { matchesPattern } from "../../src/matchesPattern";

describe("matchesPattern", () => {
  describe("exact string matching", () => {
    it("should match exact strings", () => {
      expect(matchesPattern("Button", "Button")).toBe(true);
      expect(matchesPattern("handleClick", "handleClick")).toBe(true);
    });

    it("should not match different strings", () => {
      expect(matchesPattern("Button", "Card")).toBe(false);
      expect(matchesPattern("handleClick", "handleSubmit")).toBe(false);
    });
  });

  describe("glob pattern matching", () => {
    it("should match glob patterns with *", () => {
      expect(matchesPattern("Button", "Button*")).toBe(true);
      expect(matchesPattern("ButtonPrimary", "Button*")).toBe(true);
      expect(matchesPattern("handleClick", "handle*")).toBe(true);
      expect(matchesPattern("Card", "Button*")).toBe(false);
    });

    it("should match glob patterns with ?", () => {
      expect(matchesPattern("Button1", "Button?")).toBe(true);
      expect(matchesPattern("Button12", "Button?")).toBe(false);
    });

    it("should match glob patterns with []", () => {
      expect(matchesPattern("Button1", "Button[123]")).toBe(true);
      expect(matchesPattern("Button4", "Button[123]")).toBe(false);
    });
  });

  describe("regex pattern matching", () => {
    it("should match regex patterns", () => {
      expect(matchesPattern("handleClick", /^handle/)).toBe(true);
      expect(matchesPattern("handleSubmit", /^handle/)).toBe(true);
      expect(matchesPattern("onClick", /^handle/)).toBe(false);
    });

    it("should match complex regex patterns", () => {
      expect(matchesPattern("ButtonPrimary", /^Button[A-Z]/)).toBe(true);
      expect(matchesPattern("Buttonprimary", /^Button[A-Z]/)).toBe(false);
    });
  });
});
