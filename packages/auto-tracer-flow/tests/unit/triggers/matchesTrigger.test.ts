import { describe, it, expect } from "vitest";
import { matchesTrigger } from "../../../src/lib/triggers/matchesTrigger";

describe("matchesTrigger (Flow)", () => {
  describe("null and undefined patterns", () => {
    it("should return false for null pattern", () => {
      expect(matchesTrigger("handleClick", null)).toBe(false);
    });

    it("should return false for undefined pattern", () => {
      expect(matchesTrigger("handleClick", undefined as unknown as null)).toBe(
        false
      );
    });
  });

  describe("empty and whitespace patterns", () => {
    it("should return false for empty string pattern", () => {
      expect(matchesTrigger("handleClick", "")).toBe(false);
    });

    it("should return false for whitespace-only pattern", () => {
      expect(matchesTrigger("handleClick", "   ")).toBe(false);
    });

    it("should return false for tab-only pattern", () => {
      expect(matchesTrigger("handleClick", "\t")).toBe(false);
    });

    it("should return false for newline pattern", () => {
      expect(matchesTrigger("handleClick", "\n")).toBe(false);
    });
  });

  describe("exact matching", () => {
    it("should match exact function name", () => {
      expect(matchesTrigger("handleClick", "handleClick")).toBe(true);
    });

    it("should not match different function name", () => {
      expect(matchesTrigger("handleClick", "handleSubmit")).toBe(false);
    });

    it("should be case-sensitive", () => {
      expect(matchesTrigger("handleClick", "handleclick")).toBe(false);
      expect(matchesTrigger("handleclick", "handleClick")).toBe(false);
    });

    it("should match function with leading/trailing whitespace in pattern", () => {
      expect(matchesTrigger("handleClick", "  handleClick  ")).toBe(true);
    });
  });

  describe("glob pattern matching", () => {
    describe("* wildcard", () => {
      it("should match functions starting with pattern", () => {
        expect(matchesTrigger("handleClick", "handle*")).toBe(true);
        expect(matchesTrigger("handleSubmit", "handle*")).toBe(true);
      });

      it("should match functions ending with pattern", () => {
        expect(matchesTrigger("handleClick", "*Click")).toBe(true);
        expect(matchesTrigger("onClick", "*Click")).toBe(true);
      });

      it("should match functions containing pattern", () => {
        expect(matchesTrigger("handleClick", "*Click*")).toBe(true);
        expect(matchesTrigger("onClickHandler", "*Click*")).toBe(true);
      });

      it("should match any function with *", () => {
        expect(matchesTrigger("handleClick", "*")).toBe(true);
        expect(matchesTrigger("anyFunction", "*")).toBe(true);
        expect(matchesTrigger("a", "*")).toBe(true);
      });

      it("should not match when pattern does not match", () => {
        expect(matchesTrigger("handleClick", "process*")).toBe(false);
        expect(matchesTrigger("handleClick", "*Submit")).toBe(false);
      });
    });

    describe("? wildcard", () => {
      it("should match single character", () => {
        expect(matchesTrigger("handleClick", "h?ndleClick")).toBe(true);
        expect(matchesTrigger("hxndleClick", "h?ndleClick")).toBe(true);
      });

      it("should not match zero characters", () => {
        expect(matchesTrigger("hndleClick", "h?ndleClick")).toBe(false);
      });

      it("should not match multiple characters", () => {
        expect(matchesTrigger("haxndleClick", "h?ndleClick")).toBe(false);
      });

      it("should match multiple ? for multiple characters", () => {
        expect(matchesTrigger("handleClick", "??ndleClick")).toBe(true);
        expect(matchesTrigger("abndleClick", "??ndleClick")).toBe(true);
      });
    });

    describe("[] character class", () => {
      it("should match characters in set", () => {
        expect(matchesTrigger("handleClick", "h[aei]ndleClick")).toBe(true);
        expect(matchesTrigger("hindleClick", "h[aei]ndleClick")).toBe(true);
        expect(matchesTrigger("hendleClick", "h[aei]ndleClick")).toBe(true);
      });

      it("should not match characters not in set", () => {
        expect(matchesTrigger("hondleClick", "h[aei]ndleClick")).toBe(false);
        expect(matchesTrigger("hundleClick", "h[aei]ndleClick")).toBe(false);
      });

      it("should support character ranges", () => {
        expect(matchesTrigger("handle1", "handle[0-9]")).toBe(true);
        expect(matchesTrigger("handle5", "handle[0-9]")).toBe(true);
        expect(matchesTrigger("handlea", "handle[a-z]")).toBe(true);
        expect(matchesTrigger("handlez", "handle[a-z]")).toBe(true);
      });
    });

    describe("complex glob patterns", () => {
      it("should match prefix with multiple wildcards", () => {
        expect(matchesTrigger("handleClickButton", "handle*Button")).toBe(
          true
        );
        expect(matchesTrigger("handleSubmitButton", "handle*Button")).toBe(
          true
        );
      });

      it("should match with pattern combining * and ?", () => {
        expect(matchesTrigger("handleClick1", "handleClick?")).toBe(true);
        expect(matchesTrigger("handleClick2", "handleClick?")).toBe(true);
        expect(matchesTrigger("handleClick", "handleClick?")).toBe(false);
      });

      it("should support nested patterns", () => {
        expect(matchesTrigger("App.onClick.handler", "App.*.handler")).toBe(
          true
        );
        expect(matchesTrigger("App.onSubmit.handler", "App.*.handler")).toBe(
          true
        );
      });
    });
  });

  describe("regex pattern matching", () => {
    it("should match using regex pattern", () => {
      expect(matchesTrigger("handleClick", /^handle/)).toBe(true);
      expect(matchesTrigger("handleClick", /Click$/)).toBe(true);
      expect(matchesTrigger("handleClick", /^handleClick$/)).toBe(true);
    });

    it("should not match when regex does not match", () => {
      expect(matchesTrigger("handleClick", /^process/)).toBe(false);
      expect(matchesTrigger("handleClick", /Submit$/)).toBe(false);
    });

    it("should support complex regex patterns", () => {
      expect(matchesTrigger("handleClick123", /Click\d+$/)).toBe(true);
      expect(matchesTrigger("handleClick", /Click\d+$/)).toBe(false);
    });

    it("should support case-insensitive regex", () => {
      expect(matchesTrigger("handleClick", /handleclick/i)).toBe(true);
      expect(matchesTrigger("HANDLECLICK", /handleclick/i)).toBe(true);
    });
  });

  describe("real-world function names", () => {
    it("should match common handler patterns", () => {
      // Event handlers
      expect(matchesTrigger("handleClick", "handle*")).toBe(true);
      expect(matchesTrigger("handleSubmit", "handle*")).toBe(true);
      expect(matchesTrigger("onClick", "on*")).toBe(true);
      expect(matchesTrigger("onSubmit", "on*")).toBe(true);

      // Process functions
      expect(matchesTrigger("processData", "process*")).toBe(true);
      expect(matchesTrigger("processPayment", "process*")).toBe(true);

      // Fetch functions
      expect(matchesTrigger("fetchUser", "fetch*")).toBe(true);
      expect(matchesTrigger("fetchData", "fetch*")).toBe(true);

      // Validate functions
      expect(matchesTrigger("validateEmail", "validate*")).toBe(true);
      expect(matchesTrigger("validateForm", "validate*")).toBe(true);
    });

    it("should support nested function names", () => {
      expect(matchesTrigger("App.handleClick", "App.*")).toBe(true);
      expect(matchesTrigger("Component.onClick", "Component.*")).toBe(true);
    });

    it("should support callback-style names", () => {
      expect(matchesTrigger("callback", "callback")).toBe(true);
      expect(matchesTrigger("onSuccess", "on*")).toBe(true);
      expect(matchesTrigger("onError", "on*")).toBe(true);
    });

    it("should support hook-wrapped function names", () => {
      // These names might appear in chained function contexts
      expect(matchesTrigger("useCallback:handleClick", "*handleClick")).toBe(
        true
      );
      expect(matchesTrigger("Component:handleSubmit", "*handleSubmit")).toBe(
        true
      );
    });
  });

  describe("edge cases", () => {
    it("should handle functions with special characters", () => {
      expect(matchesTrigger("handle-click", "handle-*")).toBe(true);
      expect(matchesTrigger("handle_click", "handle_*")).toBe(true);
      expect(matchesTrigger("handle$click", "handle$*")).toBe(true);
    });

    it("should handle very long function names", () => {
      const longName = "a".repeat(1000);
      expect(matchesTrigger(longName, "a*")).toBe(true);
      expect(matchesTrigger(longName, longName)).toBe(true);
    });

    it("should handle single character function names", () => {
      expect(matchesTrigger("a", "a")).toBe(true);
      expect(matchesTrigger("a", "?")).toBe(true);
      expect(matchesTrigger("a", "*")).toBe(true);
    });

    it("should handle numeric function names", () => {
      expect(matchesTrigger("123handler", "123*")).toBe(true);
      expect(matchesTrigger("handler123", "*123")).toBe(true);
    });

    it("should handle anonymous function placeholder", () => {
      expect(matchesTrigger("anonymous", "anonymous")).toBe(true);
      expect(matchesTrigger("anonymous", "anon*")).toBe(true);
    });
  });
});
