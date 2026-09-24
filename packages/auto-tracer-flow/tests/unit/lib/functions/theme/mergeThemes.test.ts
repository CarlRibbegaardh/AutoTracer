/**
 * @file Unit tests for mergeThemes function
 */

import { describe, expect, it } from "vitest";
import { mergeThemes } from "../../../../../src/lib/functions/theme/mergeThemes";
import { DEFAULT_FLOW_THEME } from "../../../../../src/lib/constants/defaultTheme";
import type { FlowThemeConfig } from "../../../../../src/lib/types/FlowThemeConfig";

describe("mergeThemes", () => {
  describe("with no custom theme", () => {
    it("returns default theme", () => {
      const result = mergeThemes(undefined);
      expect(result).toBe(DEFAULT_FLOW_THEME);
    });
  });

  describe("with partial custom theme", () => {
    it("merges custom asyncStart with default for other categories", () => {
      const custom: FlowThemeConfig = {
        asyncStart: {
          lightMode: { background: "blue" },
          darkMode: { background: "navy" },
        },
      };
      const result = mergeThemes(custom);

      expect(result.asyncStart!.lightMode?.background).toBe("blue");
      expect(result.asyncStart!.darkMode?.background).toBe("navy");
      // Other categories should use default
      expect(result.functionEnter).toStrictEqual(DEFAULT_FLOW_THEME.functionEnter);
    });

    it("preserves both light and dark modes from custom", () => {
      const custom: FlowThemeConfig = {
        exception: {
          lightMode: { background: "red", text: "white" },
          darkMode: { background: "darkred", text: "lightgray" },
        },
      };
      const result = mergeThemes(custom);

      expect(result.exception!.lightMode?.background).toBe("red");
      expect(result.exception!.lightMode?.text).toBe("white");
      expect(result.exception!.darkMode?.background).toBe("darkred");
      expect(result.exception!.darkMode?.text).toBe("lightgray");
    });
  });

  describe("with custom overriding defaults", () => {
    it("prioritizes custom theme over default", () => {
      const custom: FlowThemeConfig = {
        parameter: {
          lightMode: { bold: true, text: "purple" },
        },
      };
      const result = mergeThemes(custom);

      expect(result.parameter!.lightMode?.bold).toBe(true);
      expect(result.parameter!.lightMode?.text).toBe("purple");
    });

    it("merges all 8 categories independently", () => {
      const custom: FlowThemeConfig = {
        asyncStart: { lightMode: { background: "blue" } },
        asyncComplete: { lightMode: { background: "green" } },
        functionEnter: { lightMode: { background: "yellow" } },
        functionExit: { lightMode: { background: "orange" } },
        parameter: { lightMode: { background: "purple" } },
        returnValue: { lightMode: { background: "pink" } },
        exception: { lightMode: { background: "red" } },
        runtimeControl: { lightMode: { background: "gray" } },
      };
      const result = mergeThemes(custom);

      expect(result.asyncStart!.lightMode?.background).toBe("blue");
      expect(result.asyncComplete!.lightMode?.background).toBe("green");
      expect(result.functionEnter!.lightMode?.background).toBe("yellow");
      expect(result.functionExit!.lightMode?.background).toBe("orange");
      expect(result.parameter!.lightMode?.background).toBe("purple");
      expect(result.returnValue!.lightMode?.background).toBe("pink");
      expect(result.exception!.lightMode?.background).toBe("red");
      expect(result.runtimeControl!.lightMode?.background).toBe("gray");
    });
  });

  describe("return type structure", () => {
    it("returns complete FlowThemeConfig with all 8 categories", () => {
      const result = mergeThemes(undefined);

      expect(result).toHaveProperty("asyncStart");
      expect(result).toHaveProperty("asyncComplete");
      expect(result).toHaveProperty("functionEnter");
      expect(result).toHaveProperty("functionExit");
      expect(result).toHaveProperty("parameter");
      expect(result).toHaveProperty("returnValue");
      expect(result).toHaveProperty("exception");
      expect(result).toHaveProperty("runtimeControl");
    });

    it("each category has lightMode and darkMode", () => {
      const result = mergeThemes(undefined);

      expect(result.asyncStart).toHaveProperty("lightMode");
      expect(result.asyncStart).toHaveProperty("darkMode");
      expect(result.functionEnter).toHaveProperty("lightMode");
      expect(result.functionEnter).toHaveProperty("darkMode");
    });
  });

  describe("edge cases", () => {
    it("handles empty custom theme object", () => {
      const result = mergeThemes({});
      // Should return default theme
      expect(result).toEqual(DEFAULT_FLOW_THEME);
    });

    it("returns defaults when empty object is passed (regression test for %c without style bug)", () => {
      const result = mergeThemes({});

      // Verify the result has proper theme structure, not just empty objects
      expect(result.functionExit).toBeDefined();
      expect(result.functionExit?.lightMode).toBeDefined();
      expect(result.functionExit?.lightMode?.bold).toBeDefined();
      expect(result.functionExit?.lightMode?.bold).toBe(true);

      // Should match DEFAULT_FLOW_THEME exactly
      expect(result).toEqual(DEFAULT_FLOW_THEME);
    });

    it("handles custom theme with only lightMode", () => {
      const custom: FlowThemeConfig = {
        asyncStart: {
          lightMode: { background: "white" },
        },
      };
      const result = mergeThemes(custom);

      expect(result.asyncStart!.lightMode?.background).toBe("white");
      // Should preserve default darkMode
      expect(result.asyncStart!.darkMode).toStrictEqual(DEFAULT_FLOW_THEME.asyncStart?.darkMode);
    });

    it("handles custom theme with only darkMode", () => {
      const custom: FlowThemeConfig = {
        asyncStart: {
          darkMode: { background: "navy" },
        },
      };
      const result = mergeThemes(custom);

      expect(result.asyncStart!.darkMode?.background).toBe("navy");
      // Should preserve default lightMode
      expect(result.asyncStart!.lightMode).toStrictEqual(DEFAULT_FLOW_THEME.asyncStart?.lightMode);
    });
  });
});
