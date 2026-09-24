/**
 * @file Unit tests for mergeThemes function
 * Tests deep merge logic for React18 theme configuration
 */

import { describe, expect, it } from "vitest";
import { mergeThemes } from "../../../src/lib/functions/theme/mergeThemes";
import { defaultReactTracerOptions } from "../../../src/lib/types/defaultSettings";

const DEFAULT_REACT_THEME = defaultReactTracerOptions.colors!;

type ReactThemeConfig = typeof DEFAULT_REACT_THEME;

describe("mergeThemes", () => {
  describe("with no custom theme", () => {
    it("returns default theme", () => {
      const result = mergeThemes(undefined);
      expect(result).toBe(DEFAULT_REACT_THEME);
    });
  });

  describe("with partial custom theme", () => {
    it("merges custom definitiveRender with default for other categories", () => {
      const custom: Partial<ReactThemeConfig> = {
        definitiveRender: {
          lightMode: { background: "blue" },
          darkMode: { background: "navy" },
        },
      };
      const result = mergeThemes(custom);

      expect(result.definitiveRender!.lightMode?.background).toBe("blue");
      expect(result.definitiveRender!.darkMode?.background).toBe("navy");
      // Other categories should use default
      expect(result.propChange).toStrictEqual(DEFAULT_REACT_THEME.propChange);
    });

    it("preserves both light and dark modes from custom", () => {
      const custom: Partial<ReactThemeConfig> = {
        errorStatements: {
          lightMode: { background: "red", text: "white" },
          darkMode: { background: "darkred", text: "lightgray" },
        },
      };
      const result = mergeThemes(custom);

      expect(result.errorStatements!.lightMode?.background).toBe("red");
      expect(result.errorStatements!.lightMode?.text).toBe("white");
      expect(result.errorStatements!.darkMode?.background).toBe("darkred");
      expect(result.errorStatements!.darkMode?.text).toBe("lightgray");
    });
  });

  describe("with custom overriding defaults", () => {
    it("prioritizes custom theme over default", () => {
      const custom: Partial<ReactThemeConfig> = {
        propChange: {
          lightMode: { bold: true, text: "purple" },
        },
      };
      const result = mergeThemes(custom);

      expect(result.propChange!.lightMode?.bold).toBe(true);
      expect(result.propChange!.lightMode?.text).toBe("purple");
    });

    it("merges all 13 categories independently", () => {
      const custom: Partial<ReactThemeConfig> = {
        definitiveRender: { lightMode: { background: "blue" } },
        propInitial: { lightMode: { background: "green" } },
        propChange: { lightMode: { background: "yellow" } },
        stateInitial: { lightMode: { background: "orange" } },
        stateChange: { lightMode: { background: "purple" } },
        logStatements: { lightMode: { background: "pink" } },
        warnStatements: { lightMode: { background: "red" } },
        errorStatements: { lightMode: { background: "gray" } },
        reconciled: { lightMode: { background: "white" } },
        skipped: { lightMode: { background: "black" } },
        identicalStateValueWarning: { lightMode: { background: "brown" } },
        identicalPropValueWarning: { lightMode: { background: "cyan" } },
        other: { lightMode: { background: "magenta" } },
      };
      const result = mergeThemes(custom);

      expect(result.definitiveRender!.lightMode?.background).toBe("blue");
      expect(result.propInitial!.lightMode?.background).toBe("green");
      expect(result.propChange!.lightMode?.background).toBe("yellow");
      expect(result.stateInitial!.lightMode?.background).toBe("orange");
      expect(result.stateChange!.lightMode?.background).toBe("purple");
      expect(result.logStatements!.lightMode?.background).toBe("pink");
      expect(result.warnStatements!.lightMode?.background).toBe("red");
      expect(result.errorStatements!.lightMode?.background).toBe("gray");
      expect(result.reconciled!.lightMode?.background).toBe("white");
      expect(result.skipped!.lightMode?.background).toBe("black");
      expect(result.identicalStateValueWarning!.lightMode?.background).toBe("brown");
      expect(result.identicalPropValueWarning!.lightMode?.background).toBe("cyan");
      expect(result.other!.lightMode?.background).toBe("magenta");
    });
  });

  describe("return type structure", () => {
    it("returns complete ReactThemeConfig with all 13 categories", () => {
      const result = mergeThemes(undefined);

      expect(result).toHaveProperty("definitiveRender");
      expect(result).toHaveProperty("propInitial");
      expect(result).toHaveProperty("propChange");
      expect(result).toHaveProperty("stateInitial");
      expect(result).toHaveProperty("stateChange");
      expect(result).toHaveProperty("logStatements");
      expect(result).toHaveProperty("warnStatements");
      expect(result).toHaveProperty("errorStatements");
      expect(result).toHaveProperty("reconciled");
      expect(result).toHaveProperty("skipped");
      expect(result).toHaveProperty("identicalStateValueWarning");
      expect(result).toHaveProperty("identicalPropValueWarning");
      expect(result).toHaveProperty("other");
    });

    it("each category has lightMode and darkMode", () => {
      const result = mergeThemes(undefined);

      expect(result.definitiveRender).toHaveProperty("lightMode");
      expect(result.definitiveRender).toHaveProperty("darkMode");
      expect(result.propChange).toHaveProperty("lightMode");
      expect(result.propChange).toHaveProperty("darkMode");
    });
  });

  describe("edge cases", () => {
    it("handles empty custom theme object", () => {
      const result = mergeThemes({});
      // Should return default theme
      expect(result).toEqual(DEFAULT_REACT_THEME);
    });

    it("returns defaults when empty object is passed (regression test for %c without style bug)", () => {
      const result = mergeThemes({});

      // Verify the result has proper theme structure, not just empty objects
      expect(result.definitiveRender).toBeDefined();
      expect(result.definitiveRender?.lightMode).toBeDefined();
      expect(result.definitiveRender?.lightMode?.bold).toBeDefined();
      expect(result.definitiveRender?.lightMode?.bold).toBe(true);

      // Should match DEFAULT_REACT_THEME exactly
      expect(result).toEqual(DEFAULT_REACT_THEME);
    });

    it("handles custom theme with only lightMode", () => {
      const custom: Partial<ReactThemeConfig> = {
        definitiveRender: {
          lightMode: { background: "white" },
        },
      };
      const result = mergeThemes(custom);

      expect(result.definitiveRender!.lightMode?.background).toBe("white");
      // Should preserve default darkMode
      expect(result.definitiveRender!.darkMode).toStrictEqual(DEFAULT_REACT_THEME.definitiveRender?.darkMode);
    });

    it("handles custom theme with only darkMode", () => {
      const custom: Partial<ReactThemeConfig> = {
        definitiveRender: {
          darkMode: { background: "navy" },
        },
      };
      const result = mergeThemes(custom);

      expect(result.definitiveRender!.darkMode?.background).toBe("navy");
      // Should preserve default lightMode
      expect(result.definitiveRender!.lightMode).toStrictEqual(DEFAULT_REACT_THEME.definitiveRender?.lightMode);
    });
  });
});
