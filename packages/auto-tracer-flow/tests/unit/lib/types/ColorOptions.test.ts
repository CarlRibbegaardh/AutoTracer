import { describe, it, expect } from "vitest";
import type { ColorOptions } from "../../../../src/lib/types/ColorOptions";
import type { ThemeOptions } from "../../../../src/lib/types/ThemeOptions";

describe("ColorOptions", () => {
  describe("type definition", () => {
    it("should accept object with no properties", () => {
      const color: ColorOptions = {};
      expect(color).toEqual({});
    });

    it("should accept darkMode ThemeOptions", () => {
      const color: ColorOptions = {
        darkMode: { text: "#4fd6ff", bold: true },
      };
      expect(color.darkMode).toEqual({ text: "#4fd6ff", bold: true });
    });

    it("should accept lightMode ThemeOptions", () => {
      const color: ColorOptions = {
        lightMode: { text: "#0044ff", bold: true },
      };
      expect(color.lightMode).toEqual({ text: "#0044ff", bold: true });
    });

    it("should accept icon string", () => {
      const color: ColorOptions = {
        icon: "🚀",
      };
      expect(color.icon).toBe("🚀");
    });

    it("should accept all properties together", () => {
      const color: ColorOptions = {
        darkMode: { text: "#4fd6ff", bold: true },
        lightMode: { text: "#0044ff", bold: true },
        icon: "⚡",
      };

      expect(color.darkMode).toEqual({ text: "#4fd6ff", bold: true });
      expect(color.lightMode).toEqual({ text: "#0044ff", bold: true });
      expect(color.icon).toBe("⚡");
    });

    it("should accept partial ThemeOptions for modes", () => {
      const color: ColorOptions = {
        darkMode: { bold: true },
        lightMode: { italic: true },
      };

      expect(color.darkMode).toEqual({ bold: true });
      expect(color.lightMode).toEqual({ italic: true });
    });

    it("should match React18 ColorOptions structure exactly", () => {
      // This test ensures we maintain compatibility with React18's theme system
      const reactStyleColor: ColorOptions = {
        darkMode: { text: "#4fd6ff", bold: true },
        lightMode: { text: "#0044ff", bold: true },
        icon: "⚡",
      };

      // Verify it has exactly the expected properties
      const keys = Object.keys(reactStyleColor).sort();
      expect(keys).toEqual(["darkMode", "icon", "lightMode"]);
    });

    it("should work with empty ThemeOptions", () => {
      const color: ColorOptions = {
        darkMode: {},
        lightMode: {},
      };

      expect(color.darkMode).toEqual({});
      expect(color.lightMode).toEqual({});
    });

    it("should support all ThemeOptions properties", () => {
      const fullTheme: ThemeOptions = {
        background: "#fff0f0",
        text: "#ff0000",
        bold: true,
        italic: false,
      };

      const color: ColorOptions = {
        darkMode: fullTheme,
        lightMode: { ...fullTheme, background: "#f0f0ff" },
        icon: "💥",
      };

      expect(color.darkMode?.background).toBe("#fff0f0");
      expect(color.lightMode?.background).toBe("#f0f0ff");
    });
  });
});
