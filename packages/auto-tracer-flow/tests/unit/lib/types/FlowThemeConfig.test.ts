import { describe, it, expect } from "vitest";
import type { FlowThemeConfig } from "../../../../src/lib/types/FlowThemeConfig";

/** @internal */
type ExpectFalse<T extends false> = T;

/** @internal */
type FlowThemeConfigHasOutputMode = "outputMode" extends keyof FlowThemeConfig
  ? true
  : false;

/** @internal */
type FlowThemeConfigHasTreeRenderingMode =
  "treeRenderingMode" extends keyof FlowThemeConfig ? true : false;

/** @internal */
type FlowThemeConfigHasValueRenderingMode =
  "valueRenderingMode" extends keyof FlowThemeConfig ? true : false;

/** @internal */
type FlowThemeConfigHasGroupMode = "groupMode" extends keyof FlowThemeConfig
  ? true
  : false;

/** @internal */
type _FlowThemeConfigMustNotExposeOutputMode = ExpectFalse<
  FlowThemeConfigHasOutputMode
>;

/** @internal */
type _FlowThemeConfigMustNotExposeTreeRenderingMode = ExpectFalse<
  FlowThemeConfigHasTreeRenderingMode
>;

/** @internal */
type _FlowThemeConfigMustNotExposeValueRenderingMode = ExpectFalse<
  FlowThemeConfigHasValueRenderingMode
>;

/** @internal */
type _FlowThemeConfigMustNotExposeGroupMode = ExpectFalse<
  FlowThemeConfigHasGroupMode
>;

describe("FlowThemeConfig", () => {
  describe("type definition", () => {
    it("should accept empty config", () => {
      const config: FlowThemeConfig = {};
      expect(config).toEqual({});
    });

    it("should accept asyncStart ColorOptions", () => {
      const config: FlowThemeConfig = {
        asyncStart: {
          lightMode: { text: "#0044ff", bold: true },
          darkMode: { text: "#4fd6ff", bold: true },
          icon: "🚀",
        },
      };
      expect(config.asyncStart).toBeDefined();
      expect(config.asyncStart?.icon).toBe("🚀");
    });

    it("should accept asyncComplete ColorOptions", () => {
      const config: FlowThemeConfig = {
        asyncComplete: {
          lightMode: { text: "#00aa00", bold: true },
          darkMode: { text: "#4ade80", bold: true },
          icon: "✅",
        },
      };
      expect(config.asyncComplete).toBeDefined();
      expect(config.asyncComplete?.icon).toBe("✅");
    });

    it("should accept functionEnter ColorOptions", () => {
      const config: FlowThemeConfig = {
        functionEnter: {
          lightMode: { text: "#666666" },
          darkMode: { text: "#9ca3af" },
          icon: "→",
        },
      };
      expect(config.functionEnter).toBeDefined();
      expect(config.functionEnter?.icon).toBe("→");
    });

    it("should accept functionExit ColorOptions", () => {
      const config: FlowThemeConfig = {
        functionExit: {
          lightMode: { text: "#666666" },
          darkMode: { text: "#9ca3af" },
          icon: "←",
        },
      };
      expect(config.functionExit).toBeDefined();
      expect(config.functionExit?.icon).toBe("←");
    });

    it("should accept parameter ColorOptions", () => {
      const config: FlowThemeConfig = {
        parameter: {
          lightMode: { text: "#9966ff", italic: true },
          darkMode: { text: "#c4b5fd", italic: true },
        },
      };
      expect(config.parameter).toBeDefined();
      expect(config.parameter?.lightMode?.italic).toBe(true);
    });

    it("should accept returnValue ColorOptions", () => {
      const config: FlowThemeConfig = {
        returnValue: {
          lightMode: { text: "#00aaaa" },
          darkMode: { text: "#5eead4" },
        },
      };
      expect(config.returnValue).toBeDefined();
    });

    it("should accept exception ColorOptions", () => {
      const config: FlowThemeConfig = {
        exception: {
          lightMode: { text: "#ff0000", background: "#fff0f0", bold: true },
          darkMode: { text: "#fca5a5", background: "#3f1f1f", bold: true },
          icon: "💥",
        },
      };
      expect(config.exception).toBeDefined();
      expect(config.exception?.icon).toBe("💥");
      expect(config.exception?.lightMode?.background).toBe("#fff0f0");
    });

    it("should accept runtimeControl ColorOptions", () => {
      const config: FlowThemeConfig = {
        runtimeControl: {
          lightMode: { text: "#888888" },
          darkMode: { text: "#9ca3af" },
          icon: "🔧",
        },
      };
      expect(config.runtimeControl).toBeDefined();
      expect(config.runtimeControl?.icon).toBe("🔧");
    });

    it("should accept all semantic categories together", () => {
      const config: FlowThemeConfig = {
        asyncStart: {
          icon: "🚀",
          lightMode: { bold: true },
          darkMode: { bold: true },
        },
        asyncComplete: {
          icon: "✅",
          lightMode: { bold: true },
          darkMode: { bold: true },
        },
        functionEnter: {
          icon: "→",
          lightMode: { bold: true },
          darkMode: { bold: true },
        },
        functionExit: {
          icon: "←",
          lightMode: { bold: true },
          darkMode: { bold: true },
        },
        parameter: {
          lightMode: { italic: true },
          darkMode: { italic: true },
        },
        returnValue: {
          lightMode: {},
          darkMode: {},
        },
        exception: {
          icon: "💥",
          lightMode: { bold: true },
          darkMode: { bold: true },
        },
        runtimeControl: {
          icon: "🔧",
          lightMode: {},
          darkMode: {},
        },
      };

      expect(Object.keys(config).sort()).toEqual([
        "asyncComplete",
        "asyncStart",
        "exception",
        "functionEnter",
        "functionExit",
        "parameter",
        "returnValue",
        "runtimeControl",
      ]);
    });

    it("should match the semantic categories from the spec", () => {
      // Ensure all categories from the design spec are present
      const config: FlowThemeConfig = {
        asyncStart: {},
        asyncComplete: {},
        functionEnter: {},
        functionExit: {},
        parameter: {},
        returnValue: {},
        exception: {},
        runtimeControl: {},
      };

      // All eight semantic categories
      expect(Object.keys(config).length).toBe(8);
    });

    it("should follow React18 pattern with ColorOptions for each category", () => {
      // Verify it uses the same ColorOptions structure as React18
      const config: FlowThemeConfig = {
        asyncStart: {
          darkMode: { text: "#4fd6ff", bold: true },
          lightMode: { text: "#0044ff", bold: true },
          icon: "🚀",
        },
      };

      // Check structure matches React18's pattern
      expect(config.asyncStart).toHaveProperty("darkMode");
      expect(config.asyncStart).toHaveProperty("lightMode");
      expect(config.asyncStart).toHaveProperty("icon");
    });
  });
});
