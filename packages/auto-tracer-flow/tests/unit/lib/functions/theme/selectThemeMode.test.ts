/**
 * @file Unit tests for selectThemeMode function
 */

import { describe, expect, it } from "vitest";
import { selectThemeMode } from "../../../../../src/lib/functions/theme/selectThemeMode";
import type { ColorOptions } from "../../../../../src/lib/types/ColorOptions";

describe("selectThemeMode", () => {
  describe("with both modes defined", () => {
    it("selects lightMode when scheme is light", () => {
      const colors: ColorOptions = {
        lightMode: { text: "#000000" },
        darkMode: { text: "#ffffff" },
      };

      const result = selectThemeMode(colors, "light");

      expect(result).toEqual({ text: "#000000" });
    });

    it("selects darkMode when scheme is dark", () => {
      const colors: ColorOptions = {
        lightMode: { text: "#000000" },
        darkMode: { text: "#ffffff" },
      };

      const result = selectThemeMode(colors, "dark");

      expect(result).toEqual({ text: "#ffffff" });
    });
  });

  describe("with only one mode defined", () => {
    it("returns lightMode when darkMode is missing and scheme is dark", () => {
      const colors: ColorOptions = {
        lightMode: { text: "#000000" },
      };

      const result = selectThemeMode(colors, "dark");

      expect(result).toEqual({ text: "#000000" });
    });

    it("returns darkMode when lightMode is missing and scheme is light", () => {
      const colors: ColorOptions = {
        darkMode: { text: "#ffffff" },
      };

      const result = selectThemeMode(colors, "light");

      expect(result).toEqual({ text: "#ffffff" });
    });
  });

  describe("with empty ColorOptions", () => {
    it("returns empty ThemeOptions when both modes are undefined", () => {
      const colors: ColorOptions = {};

      const result = selectThemeMode(colors, "light");

      expect(result).toEqual({});
    });
  });

  describe("with undefined ColorOptions", () => {
    it("returns empty ThemeOptions when colors is undefined", () => {
      const result = selectThemeMode(undefined, "light");

      expect(result).toEqual({});
    });
  });
});
