import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { existsSync, mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import { loadThemeFiles } from "../../../src/lib/functions/theme/loadThemeFiles";
import type { FlowThemeConfig } from "../../../src/lib/types/FlowThemeConfig";

describe("loadThemeFiles", () => {
  const testDir = join(process.cwd(), "test-temp-themes");

  beforeEach(() => {
    // Create test directory
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Step 1: Base theme file (*flow-theme.json)", () => {
    it("should load base theme file when it exists", async () => {
      const baseTheme: Partial<FlowThemeConfig> = {
        functionEnter: {
          lightMode: { text: "#ff0000" },
          darkMode: { text: "#00ff00" },
          icon: "➡️",
        },
      };

      writeFileSync(
        join(testDir, "flow-theme.json"),
        JSON.stringify(baseTheme)
      );

      const result = await loadThemeFiles(testDir);

      expect(result).toEqual(baseTheme);
    });

    it("should load named base theme file (colorblind-flow-theme.json)", async () => {
      const colorblindTheme: Partial<FlowThemeConfig> = {
        functionEnter: {
          lightMode: { text: "#0044cc", bold: true },
          darkMode: { text: "#88aaff", bold: true },
          icon: "→",
        },
      };

      writeFileSync(
        join(testDir, "colorblind-flow-theme.json"),
        JSON.stringify(colorblindTheme)
      );

      const result = await loadThemeFiles(testDir);

      expect(result).toEqual(colorblindTheme);
    });

    it("should use first match when multiple base theme files exist", async () => {
      const firstTheme: Partial<FlowThemeConfig> = {
        functionEnter: {
          icon: "FIRST",
        },
      };

      const secondTheme: Partial<FlowThemeConfig> = {
        functionEnter: {
          icon: "SECOND",
        },
      };

      // Create in specific order to test first-match behavior
      writeFileSync(
        join(testDir, "a-flow-theme.json"),
        JSON.stringify(firstTheme)
      );
      writeFileSync(
        join(testDir, "z-flow-theme.json"),
        JSON.stringify(secondTheme)
      );

      const result = await loadThemeFiles(testDir);

      // Should use first alphabetically sorted match
      expect(result.functionEnter?.icon).toBe("FIRST");
    });

    it("should return empty object when no theme files exist", async () => {
      const result = await loadThemeFiles(testDir);

      expect(result).toEqual({});
    });
  });

  describe("Step 2: Light mode override (*flow-theme-light.json)", () => {
    it("should merge light mode override with base theme", async () => {
      const baseTheme: Partial<FlowThemeConfig> = {
        functionEnter: {
          lightMode: { text: "#ff0000" },
          darkMode: { text: "#00ff00" },
          icon: "→",
        },
        functionExit: {
          lightMode: { text: "#0000ff" },
          darkMode: { text: "#ffff00" },
        },
      };

      const lightOverride: Partial<FlowThemeConfig> = {
        functionEnter: {
          lightMode: { text: "#ff00ff", bold: true }, // Override light mode
          // darkMode not specified - should keep from base
        },
      };

      writeFileSync(
        join(testDir, "flow-theme.json"),
        JSON.stringify(baseTheme)
      );
      writeFileSync(
        join(testDir, "flow-theme-light.json"),
        JSON.stringify(lightOverride)
      );

      const result = await loadThemeFiles(testDir);

      expect(result.functionEnter?.lightMode).toEqual({
        text: "#ff00ff",
        bold: true,
      });
      expect(result.functionEnter?.darkMode).toEqual({ text: "#00ff00" });
      expect(result.functionEnter?.icon).toBe("→");
      expect(result.functionExit).toEqual(baseTheme.functionExit);
    });

    it("should work with named light override (colorblind-flow-theme-light.json)", async () => {
      const baseTheme: Partial<FlowThemeConfig> = {
        exception: {
          lightMode: { text: "#ff0000" },
          darkMode: { text: "#ff8888" },
          icon: "💥",
        },
      };

      const lightOverride: Partial<FlowThemeConfig> = {
        exception: {
          lightMode: { text: "#cc0000", background: "#fff0f0" },
        },
      };

      writeFileSync(
        join(testDir, "colorblind-flow-theme.json"),
        JSON.stringify(baseTheme)
      );
      writeFileSync(
        join(testDir, "colorblind-flow-theme-light.json"),
        JSON.stringify(lightOverride)
      );

      const result = await loadThemeFiles(testDir);

      expect(result.exception?.lightMode).toEqual({
        text: "#cc0000",
        background: "#fff0f0",
      });
      expect(result.exception?.darkMode).toEqual({ text: "#ff8888" });
    });
  });

  describe("Step 3: Dark mode override (*flow-theme-dark.json)", () => {
    it("should merge dark mode override with base and light themes", async () => {
      const baseTheme: Partial<FlowThemeConfig> = {
        asyncStart: {
          lightMode: { text: "#0044ff" },
          darkMode: { text: "#4fd6ff" },
          icon: "🚀",
        },
      };

      const lightOverride: Partial<FlowThemeConfig> = {
        asyncStart: {
          lightMode: { text: "#0033cc", bold: true },
        },
      };

      const darkOverride: Partial<FlowThemeConfig> = {
        asyncStart: {
          darkMode: { text: "#88ddff", italic: true },
        },
      };

      writeFileSync(
        join(testDir, "flow-theme.json"),
        JSON.stringify(baseTheme)
      );
      writeFileSync(
        join(testDir, "flow-theme-light.json"),
        JSON.stringify(lightOverride)
      );
      writeFileSync(
        join(testDir, "flow-theme-dark.json"),
        JSON.stringify(darkOverride)
      );

      const result = await loadThemeFiles(testDir);

      expect(result.asyncStart?.lightMode).toEqual({
        text: "#0033cc",
        bold: true,
      });
      expect(result.asyncStart?.darkMode).toEqual({
        text: "#88ddff",
        italic: true,
      });
      expect(result.asyncStart?.icon).toBe("🚀");
    });

    it("should work with named dark override (high-contrast-flow-theme-dark.json)", async () => {
      const baseTheme: Partial<FlowThemeConfig> = {
        returnValue: {
          lightMode: { text: "#00aa00" },
          darkMode: { text: "#00ff00" },
        },
      };

      const darkOverride: Partial<FlowThemeConfig> = {
        returnValue: {
          darkMode: { text: "#00ffaa", bold: true, background: "#003300" },
        },
      };

      writeFileSync(
        join(testDir, "high-contrast-flow-theme.json"),
        JSON.stringify(baseTheme)
      );
      writeFileSync(
        join(testDir, "high-contrast-flow-theme-dark.json"),
        JSON.stringify(darkOverride)
      );

      const result = await loadThemeFiles(testDir);

      expect(result.returnValue?.darkMode).toEqual({
        text: "#00ffaa",
        bold: true,
        background: "#003300",
      });
      expect(result.returnValue?.lightMode).toEqual({ text: "#00aa00" });
    });
  });

  describe("Priority order", () => {
    it("should apply all 3 steps in correct order when all files exist", async () => {
      const baseTheme: Partial<FlowThemeConfig> = {
        parameter: {
          lightMode: { text: "#111111" },
          darkMode: { text: "#222222" },
          icon: "BASE",
        },
        functionEnter: {
          icon: "BASE_ONLY",
        },
      };

      const lightOverride: Partial<FlowThemeConfig> = {
        parameter: {
          lightMode: { text: "#333333", italic: true },
        },
      };

      const darkOverride: Partial<FlowThemeConfig> = {
        parameter: {
          darkMode: { text: "#444444", bold: true },
        },
      };

      writeFileSync(
        join(testDir, "flow-theme.json"),
        JSON.stringify(baseTheme)
      );
      writeFileSync(
        join(testDir, "flow-theme-light.json"),
        JSON.stringify(lightOverride)
      );
      writeFileSync(
        join(testDir, "flow-theme-dark.json"),
        JSON.stringify(darkOverride)
      );

      const result = await loadThemeFiles(testDir);

      expect(result.parameter?.lightMode).toEqual({
        text: "#333333",
        italic: true,
      });
      expect(result.parameter?.darkMode).toEqual({
        text: "#444444",
        bold: true,
      });
      expect(result.parameter?.icon).toBe("BASE");
      expect(result.functionEnter?.icon).toBe("BASE_ONLY");
    });

    it("should handle missing intermediate steps gracefully", async () => {
      const baseTheme: Partial<FlowThemeConfig> = {
        asyncComplete: {
          lightMode: { text: "#aaaaaa" },
          darkMode: { text: "#bbbbbb" },
        },
      };

      const darkOverride: Partial<FlowThemeConfig> = {
        asyncComplete: {
          darkMode: { text: "#cccccc" },
        },
      };

      // Skip light override file
      writeFileSync(
        join(testDir, "flow-theme.json"),
        JSON.stringify(baseTheme)
      );
      writeFileSync(
        join(testDir, "flow-theme-dark.json"),
        JSON.stringify(darkOverride)
      );

      const result = await loadThemeFiles(testDir);

      expect(result.asyncComplete?.lightMode).toEqual({ text: "#aaaaaa" });
      expect(result.asyncComplete?.darkMode).toEqual({ text: "#cccccc" });
    });
  });

  describe("Error handling", () => {
    it("should handle invalid JSON gracefully and log warning", async () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      writeFileSync(join(testDir, "flow-theme.json"), "{ invalid json }");

      // Should return empty object rather than throwing
      const result = await loadThemeFiles(testDir);

      expect(result).toEqual({});
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[FlowTracer] Warning: Failed to parse theme file"),
        expect.any(String)
      );

      consoleWarnSpy.mockRestore();
    });

    it("should handle non-existent directory gracefully", async () => {
      const nonExistentDir = join(process.cwd(), "does-not-exist-" + Date.now());

      const result = await loadThemeFiles(nonExistentDir);

      expect(result).toEqual({});
    });

    it("should ignore non-JSON files matching pattern", async () => {
      const theme: Partial<FlowThemeConfig> = {
        functionEnter: { icon: "✓" },
      };

      writeFileSync(join(testDir, "flow-theme.json"), JSON.stringify(theme));
      writeFileSync(join(testDir, "flow-theme.txt"), "not json");
      writeFileSync(join(testDir, "flow-theme-light.md"), "# Not JSON");

      const result = await loadThemeFiles(testDir);

      // Should only load the valid .json file
      expect(result).toEqual(theme);
    });
  });

  describe("Deep merging behavior", () => {
    it("should deep merge nested properties without losing sibling keys", async () => {
      const baseTheme: Partial<FlowThemeConfig> = {
        exception: {
          lightMode: { text: "#ff0000", bold: true },
          darkMode: { text: "#ff8888", bold: true },
          icon: "💥",
        },
      };

      const lightOverride: Partial<FlowThemeConfig> = {
        exception: {
          lightMode: {
            background: "#fff0f0",
            // text and bold should be preserved from base
          },
        },
      };

      writeFileSync(
        join(testDir, "flow-theme.json"),
        JSON.stringify(baseTheme)
      );
      writeFileSync(
        join(testDir, "flow-theme-light.json"),
        JSON.stringify(lightOverride)
      );

      const result = await loadThemeFiles(testDir);

      expect(result.exception?.lightMode).toEqual({
        text: "#ff0000",
        bold: true,
        background: "#fff0f0",
      });
      expect(result.exception?.darkMode).toEqual({
        text: "#ff8888",
        bold: true,
      });
      expect(result.exception?.icon).toBe("💥");
    });
  });
});
