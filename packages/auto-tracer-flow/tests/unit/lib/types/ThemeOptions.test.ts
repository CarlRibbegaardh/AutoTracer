import { describe, it, expect } from "vitest";
import type { ThemeOptions } from "../../../../src/lib/types/ThemeOptions";

describe("ThemeOptions", () => {
  describe("type definition", () => {
    it("should accept object with no properties", () => {
      const theme: ThemeOptions = {};
      expect(theme).toEqual({});
    });

    it("should accept background color", () => {
      const theme: ThemeOptions = {
        background: "#ffffff",
      };
      expect(theme.background).toBe("#ffffff");
    });

    it("should accept text color", () => {
      const theme: ThemeOptions = {
        text: "#000000",
      };
      expect(theme.text).toBe("#000000");
    });

    it("should accept bold flag", () => {
      const theme: ThemeOptions = {
        bold: true,
      };
      expect(theme.bold).toBe(true);
    });

    it("should accept italic flag", () => {
      const theme: ThemeOptions = {
        italic: true,
      };
      expect(theme.italic).toBe(true);
    });

    it("should accept all properties together", () => {
      const theme: ThemeOptions = {
        background: "#fff0f0",
        text: "#ff0000",
        bold: true,
        italic: false,
      };

      expect(theme.background).toBe("#fff0f0");
      expect(theme.text).toBe("#ff0000");
      expect(theme.bold).toBe(true);
      expect(theme.italic).toBe(false);
    });

    it("should be assignable with partial properties", () => {
      const theme1: ThemeOptions = { text: "#0044ff" };
      const theme2: ThemeOptions = { bold: true };
      const theme3: ThemeOptions = { background: "#000000", italic: true };

      expect(theme1).toHaveProperty("text");
      expect(theme2).toHaveProperty("bold");
      expect(theme3).toHaveProperty("background");
      expect(theme3).toHaveProperty("italic");
    });

    it("should match React18 ThemeOptions structure exactly", () => {
      // This test ensures we maintain compatibility with React18's theme system
      const reactStyleTheme: ThemeOptions = {
        background: "#fff0f0",
        text: "#ff0000",
        bold: true,
        italic: false,
      };

      // Verify it has exactly the expected properties
      const keys = Object.keys(reactStyleTheme).sort();
      expect(keys).toEqual(["background", "bold", "italic", "text"]);
    });
  });
});
