import { describe, it, expect } from "vitest";
import { DEFAULT_FLOW_THEME } from "../../../../src/lib/constants/defaultTheme";
import type { FlowThemeConfig } from "../../../../src/lib/types/FlowThemeConfig";

describe("DEFAULT_FLOW_THEME", () => {
  it("should be a valid FlowThemeConfig", () => {
    const theme: FlowThemeConfig = DEFAULT_FLOW_THEME;
    expect(theme).toBeDefined();
  });

  it("should have all semantic categories defined", () => {
    expect(DEFAULT_FLOW_THEME.asyncStart).toBeDefined();
    expect(DEFAULT_FLOW_THEME.asyncComplete).toBeDefined();
    expect(DEFAULT_FLOW_THEME.functionEnter).toBeDefined();
    expect(DEFAULT_FLOW_THEME.functionExit).toBeDefined();
    expect(DEFAULT_FLOW_THEME.parameter).toBeDefined();
    expect(DEFAULT_FLOW_THEME.returnValue).toBeDefined();
    expect(DEFAULT_FLOW_THEME.exception).toBeDefined();
    expect(DEFAULT_FLOW_THEME.runtimeControl).toBeDefined();
  });

  describe("group boundaries", () => {
    it("should have bold for asyncStart (group boundary)", () => {
      expect(DEFAULT_FLOW_THEME.asyncStart?.lightMode?.bold).toBe(true);
      expect(DEFAULT_FLOW_THEME.asyncStart?.darkMode?.bold).toBe(true);
    });

    it("should have bold for asyncComplete (group boundary)", () => {
      expect(DEFAULT_FLOW_THEME.asyncComplete?.lightMode?.bold).toBe(true);
      expect(DEFAULT_FLOW_THEME.asyncComplete?.darkMode?.bold).toBe(true);
    });

    it("should have bold for functionEnter (group boundary)", () => {
      expect(DEFAULT_FLOW_THEME.functionEnter?.lightMode?.bold).toBe(true);
      expect(DEFAULT_FLOW_THEME.functionEnter?.darkMode?.bold).toBe(true);
    });

    it("should have bold for functionExit (group boundary)", () => {
      expect(DEFAULT_FLOW_THEME.functionExit?.lightMode?.bold).toBe(true);
      expect(DEFAULT_FLOW_THEME.functionExit?.darkMode?.bold).toBe(true);
    });
  });

  describe("icons", () => {
    it("should have arrow icon for asyncStart", () => {
      expect(DEFAULT_FLOW_THEME.asyncStart?.icon).toBe("→");
    });

    it("should have arrow icon for asyncComplete", () => {
      expect(DEFAULT_FLOW_THEME.asyncComplete?.icon).toBe("←");
    });

    it("should have arrow icon for functionEnter", () => {
      expect(DEFAULT_FLOW_THEME.functionEnter?.icon).toBe("→");
    });

    it("should have arrow icon for functionExit", () => {
      expect(DEFAULT_FLOW_THEME.functionExit?.icon).toBe("←");
    });

    it("should have explosion icon for exception", () => {
      expect(DEFAULT_FLOW_THEME.exception?.icon).toBe("💥");
    });

    it("should have wrench icon for runtimeControl", () => {
      expect(DEFAULT_FLOW_THEME.runtimeControl?.icon).toBe("🔧");
    });
  });

  describe("italic for parameters", () => {
    it("should have italic for parameter logging", () => {
      expect(DEFAULT_FLOW_THEME.parameter?.lightMode?.italic).toBe(true);
      expect(DEFAULT_FLOW_THEME.parameter?.darkMode?.italic).toBe(true);
    });
  });

  describe("exception styling", () => {
    it("should have bold for exception", () => {
      expect(DEFAULT_FLOW_THEME.exception?.lightMode?.bold).toBe(true);
      expect(DEFAULT_FLOW_THEME.exception?.darkMode?.bold).toBe(true);
    });
  });

  describe("monochrome theme (no colors yet)", () => {
    it("should not have text colors defined (TBD)", () => {
      // Per spec: colors are TBD, will be tuned when running with React18
      expect(DEFAULT_FLOW_THEME.asyncStart?.lightMode?.text).toBeUndefined();
      expect(DEFAULT_FLOW_THEME.asyncStart?.darkMode?.text).toBeUndefined();
    });

    it("should not have background colors defined (TBD)", () => {
      // Per spec: monochrome by default, colors TBD
      expect(DEFAULT_FLOW_THEME.parameter?.lightMode?.background).toBeUndefined();
      expect(DEFAULT_FLOW_THEME.parameter?.darkMode?.background).toBeUndefined();
    });
  });

  describe("structure validation", () => {
    it("should have both light and dark modes for all categories", () => {
      const categories = [
        "asyncStart",
        "asyncComplete",
        "functionEnter",
        "functionExit",
        "parameter",
        "returnValue",
        "exception",
        "runtimeControl",
      ] as const;

      categories.forEach((category) => {
        const config = DEFAULT_FLOW_THEME[category];
        expect(config).toBeDefined();
        expect(config?.lightMode).toBeDefined();
        expect(config?.darkMode).toBeDefined();
      });
    });
  });
});
