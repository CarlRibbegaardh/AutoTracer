import { describe, it, expect } from "vitest";
import { applyTheme } from "../../../../../src/lib/functions/theme/applyTheme";
import type { ThemeOptions } from "../../../../../src/lib/types/ThemeOptions";

describe("applyTheme", () => {
  describe("pure function behavior", () => {
    it("should be a pure function - same input produces same output", () => {
      const message = "test message";
      const theme: ThemeOptions = { text: "#ff0000", bold: true };

      const result1 = applyTheme(message, theme);
      const result2 = applyTheme(message, theme);

      expect(result1).toBe(result2);
    });

    it("should not mutate input parameters", () => {
      const message = "test";
      const theme: ThemeOptions = { text: "#ff0000" };
      const themeCopy = { ...theme };

      applyTheme(message, theme);

      expect(theme).toEqual(themeCopy);
    });
  });

  describe("no styling", () => {
    it("should return plain message when theme is empty", () => {
      const result = applyTheme("hello", {});
      expect(result).toBe("hello");
    });

    it("should return plain message when all theme properties are undefined", () => {
      const theme: ThemeOptions = {
        text: undefined,
        background: undefined,
        bold: undefined,
        italic: undefined,
      };
      const result = applyTheme("test", theme);
      expect(result).toBe("test");
    });
  });

  describe("text color", () => {
    it("should apply text color", () => {
      const result = applyTheme("message", { text: "#ff0000" });
      expect(result).toContain("color: #ff0000");
      expect(result).toContain("%c");
    });

    it("should support different color formats", () => {
      const rgb = applyTheme("test", { text: "rgb(255, 0, 0)" });
      expect(rgb).toContain("color: rgb(255, 0, 0)");

      const rgba = applyTheme("test", { text: "rgba(255, 0, 0, 0.5)" });
      expect(rgba).toContain("color: rgba(255, 0, 0, 0.5)");

      const hex = applyTheme("test", { text: "#0044ff" });
      expect(hex).toContain("color: #0044ff");
    });
  });

  describe("background color", () => {
    it("should apply background color", () => {
      const result = applyTheme("message", { background: "#fff0f0" });
      expect(result).toContain("background: #fff0f0");
      expect(result).toContain("%c");
    });
  });

  describe("bold", () => {
    it("should apply bold when true", () => {
      const result = applyTheme("message", { bold: true });
      expect(result).toContain("font-weight: bold");
      expect(result).toContain("%c");
    });

    it("should not apply bold when false", () => {
      const result = applyTheme("message", { bold: false });
      expect(result).toBe("message");
    });

    it("should not apply bold when undefined", () => {
      const result = applyTheme("message", {});
      expect(result).toBe("message");
    });
  });

  describe("italic", () => {
    it("should apply italic when true", () => {
      const result = applyTheme("message", { italic: true });
      expect(result).toContain("font-style: italic");
      expect(result).toContain("%c");
    });

    it("should not apply italic when false", () => {
      const result = applyTheme("message", { italic: false });
      expect(result).toBe("message");
    });
  });

  describe("combined styling", () => {
    it("should apply multiple styles together", () => {
      const theme: ThemeOptions = {
        text: "#ff0000",
        background: "#fff0f0",
        bold: true,
        italic: true,
      };
      const result = applyTheme("message", theme);

      expect(result).toContain("color: #ff0000");
      expect(result).toContain("background: #fff0f0");
      expect(result).toContain("font-weight: bold");
      expect(result).toContain("font-style: italic");
    });

    it("should separate CSS properties with semicolons", () => {
      const theme: ThemeOptions = {
        text: "#ff0000",
        bold: true,
      };
      const result = applyTheme("test", theme);

      expect(result).toContain("; ");
    });
  });

  describe("CSS formatting", () => {
    it("should use %c placeholders for console styling", () => {
      const result = applyTheme("message", { text: "#ff0000" });
      expect(result).toMatch(/%c.*%c/);
    });

    it("should wrap message with %c placeholders", () => {
      const result = applyTheme("test message", { text: "#ff0000" });
      expect(result).toContain("%ctest message%c");
    });

    it("should include reset placeholder", () => {
      const result = applyTheme("message", { bold: true });
      // Should have opening %c and closing %c for reset
      const matches = result.match(/%c/g);
      expect(matches).toHaveLength(2);
    });
  });

  describe("icon parameter", () => {
    it("should accept icon as third parameter", () => {
      const result = applyTheme("message", { text: "#ff0000" }, "🚀");
      expect(result).toContain("🚀");
    });

    it("should prepend icon to message", () => {
      const result = applyTheme("started", {}, "🚀");
      expect(result).toBe("🚀 started");
    });

    it("should apply styling to both icon and message", () => {
      const result = applyTheme("started", { bold: true }, "🚀");
      expect(result).toContain("%c🚀 started%c");
      expect(result).toContain("font-weight: bold");
    });

    it("should work without icon (undefined)", () => {
      const result = applyTheme("message", { text: "#ff0000" }, undefined);
      expect(result).not.toContain("undefined");
    });

    it("should work without icon (empty string)", () => {
      const result = applyTheme("message", { text: "#ff0000" }, "");
      expect(result).toContain("message");
    });
  });

  describe("return value structure", () => {
    it("should return array-like structure for console.log", () => {
      // The function should return a formatted string that can be used with console.log
      // console.log(applyTheme(...)) should work correctly
      const result = applyTheme("test", { text: "#ff0000" });
      expect(typeof result).toBe("string");
    });
  });

  describe("edge cases", () => {
    it("should handle empty message", () => {
      const result = applyTheme("", { text: "#ff0000" });
      expect(result).toContain("%c%c");
    });

    it("should handle message with special characters", () => {
      const result = applyTheme("test: \"value\"", { text: "#ff0000" });
      expect(result).toContain("test: \"value\"");
    });

    it("should handle message with line breaks", () => {
      const result = applyTheme("line1\nline2", { bold: true });
      expect(result).toContain("line1\nline2");
    });
  });

  describe("parameter count (max 3 rule)", () => {
    it("should accept exactly 3 parameters", () => {
      // This test verifies the function signature adheres to max 3 params rule
      const result = applyTheme("message", { text: "#ff0000" }, "🚀");
      expect(result).toBeDefined();
    });
  });
});
