import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { loadThemeFiles } from "../../../src/lib/functions/theme/loadThemeFiles";
import type { ReactTracerOptions } from "../../../src/lib/interfaces/ReactTracerOptions";
import { internalLogger } from "../../../src/logger/internalLogger";

type ReactThemeConfig = NonNullable<ReactTracerOptions["colors"]>;

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
      rmSync(testDir, {
        recursive: true,
        force: true,
        maxRetries: 10,
        retryDelay: 25,
      });
    }
  });

  describe("Step 1: Base theme file (*react-theme.json)", () => {
    it("should load base theme file when it exists", async () => {
      const baseTheme: ReactThemeConfig = {
        definitiveRender: {
          lightMode: { text: "#ff0000" },
          darkMode: { text: "#00ff00" },
          icon: "⚡",
        },
      };

      writeFileSync(
        join(testDir, "react-theme.json"),
        JSON.stringify(baseTheme)
      );

      const result = await loadThemeFiles(testDir);

      expect(result).toEqual(baseTheme);
    });

    it("should load named base theme file (colorblind-react-theme.json)", async () => {
      const colorblindTheme: ReactThemeConfig = {
        definitiveRender: {
          lightMode: { text: "#0044cc", bold: true },
          darkMode: { text: "#88aaff", bold: true },
          icon: "⚡",
        },
      };

      writeFileSync(
        join(testDir, "colorblind-react-theme.json"),
        JSON.stringify(colorblindTheme)
      );

      const result = await loadThemeFiles(testDir);

      expect(result).toEqual(colorblindTheme);
    });

    it("should use first match when multiple base theme files exist", async () => {
      const firstTheme: ReactThemeConfig = {
        definitiveRender: {
          icon: "FIRST",
        },
      };

      const secondTheme: ReactThemeConfig = {
        definitiveRender: {
          icon: "SECOND",
        },
      };

      // Create in specific order to test first-match behavior
      writeFileSync(
        join(testDir, "a-react-theme.json"),
        JSON.stringify(firstTheme)
      );
      writeFileSync(
        join(testDir, "z-react-theme.json"),
        JSON.stringify(secondTheme)
      );

      const result = await loadThemeFiles(testDir);

      // Should use first alphabetically sorted match
      expect(result.definitiveRender?.icon).toBe("FIRST");
    });

    it("should return empty object when no theme files exist", async () => {
      const result = await loadThemeFiles(testDir);

      expect(result).toEqual({});
    });
  });

  describe("Step 2: Light mode override (*react-theme-light.json)", () => {
    it("should merge light mode override with base theme", async () => {
      const baseTheme: ReactThemeConfig = {
        definitiveRender: {
          lightMode: { text: "#ff0000" },
          darkMode: { text: "#00ff00" },
          icon: "⚡",
        },
        stateChange: {
          lightMode: { text: "#0000ff" },
          darkMode: { text: "#ffff00" },
        },
      };

      const lightOverride: ReactThemeConfig = {
        definitiveRender: {
          lightMode: { text: "#ff00ff", bold: true }, // Override light mode
          // darkMode not specified - should keep from base
        },
      };

      writeFileSync(
        join(testDir, "react-theme.json"),
        JSON.stringify(baseTheme)
      );
      writeFileSync(
        join(testDir, "react-theme-light.json"),
        JSON.stringify(lightOverride)
      );

      const result = await loadThemeFiles(testDir);

      expect(result.definitiveRender?.lightMode).toEqual({
        text: "#ff00ff",
        bold: true,
      });
      expect(result.definitiveRender?.darkMode).toEqual({ text: "#00ff00" });
      expect(result.definitiveRender?.icon).toBe("⚡");
      expect(result.stateChange).toEqual(baseTheme.stateChange);
    });

    it("should work with named light override (colorblind-react-theme-light.json)", async () => {
      const baseTheme: ReactThemeConfig = {
        errorStatements: {
          lightMode: { text: "#ff0000" },
          darkMode: { text: "#ff8888" },
          icon: "❌",
        },
      };

      const lightOverride: ReactThemeConfig = {
        errorStatements: {
          lightMode: { text: "#cc0000", background: "#fff0f0" },
        },
      };

      writeFileSync(
        join(testDir, "colorblind-react-theme.json"),
        JSON.stringify(baseTheme)
      );
      writeFileSync(
        join(testDir, "colorblind-react-theme-light.json"),
        JSON.stringify(lightOverride)
      );

      const result = await loadThemeFiles(testDir);

      expect(result.errorStatements?.lightMode).toEqual({
        text: "#cc0000",
        background: "#fff0f0",
      });
      expect(result.errorStatements?.darkMode).toEqual({ text: "#ff8888" });
    });
  });

  describe("Step 3: Dark mode override (*react-theme-dark.json)", () => {
    it("should merge dark mode override with base and light themes", async () => {
      const baseTheme: ReactThemeConfig = {
        propChange: {
          lightMode: { text: "#0044ff" },
          darkMode: { text: "#4fd6ff" },
          icon: undefined,
        },
      };

      const lightOverride: ReactThemeConfig = {
        propChange: {
          lightMode: { text: "#0033cc", bold: true },
        },
      };

      const darkOverride: ReactThemeConfig = {
        propChange: {
          darkMode: { text: "#88ddff", italic: true },
        },
      };

      writeFileSync(
        join(testDir, "react-theme.json"),
        JSON.stringify(baseTheme)
      );
      writeFileSync(
        join(testDir, "react-theme-light.json"),
        JSON.stringify(lightOverride)
      );
      writeFileSync(
        join(testDir, "react-theme-dark.json"),
        JSON.stringify(darkOverride)
      );

      const result = await loadThemeFiles(testDir);

      expect(result.propChange?.lightMode).toEqual({
        text: "#0033cc",
        bold: true,
      });
      expect(result.propChange?.darkMode).toEqual({
        text: "#88ddff",
        italic: true,
      });
      expect(result.propChange?.icon).toBeUndefined();
    });

    it("should work with named dark override (high-contrast-react-theme-dark.json)", async () => {
      const baseTheme: ReactThemeConfig = {
        logStatements: {
          lightMode: { text: "#00aa00" },
          darkMode: { text: "#00ff00" },
        },
      };

      const darkOverride: ReactThemeConfig = {
        logStatements: {
          darkMode: { text: "#00ffaa", bold: true, background: "#003300" },
        },
      };

      writeFileSync(
        join(testDir, "high-contrast-react-theme.json"),
        JSON.stringify(baseTheme)
      );
      writeFileSync(
        join(testDir, "high-contrast-react-theme-dark.json"),
        JSON.stringify(darkOverride)
      );

      const result = await loadThemeFiles(testDir);

      expect(result.logStatements?.darkMode).toEqual({
        text: "#00ffaa",
        bold: true,
        background: "#003300",
      });
      expect(result.logStatements?.lightMode).toEqual({ text: "#00aa00" });
    });
  });

  describe("Priority order", () => {
    it("should apply all 3 steps in correct order when all files exist", async () => {
      const baseTheme: ReactThemeConfig = {
        propInitial: {
          lightMode: { text: "#111111" },
          darkMode: { text: "#222222" },
          icon: "BASE",
        },
        definitiveRender: {
          icon: "BASE_ONLY",
        },
      };

      const lightOverride: ReactThemeConfig = {
        propInitial: {
          lightMode: { text: "#333333", italic: true },
        },
      };

      const darkOverride: ReactThemeConfig = {
        propInitial: {
          darkMode: { text: "#444444", bold: true },
        },
      };

      writeFileSync(
        join(testDir, "react-theme.json"),
        JSON.stringify(baseTheme)
      );
      writeFileSync(
        join(testDir, "react-theme-light.json"),
        JSON.stringify(lightOverride)
      );
      writeFileSync(
        join(testDir, "react-theme-dark.json"),
        JSON.stringify(darkOverride)
      );

      const result = await loadThemeFiles(testDir);

      expect(result.propInitial?.lightMode).toEqual({
        text: "#333333",
        italic: true,
      });
      expect(result.propInitial?.darkMode).toEqual({
        text: "#444444",
        bold: true,
      });
      expect(result.propInitial?.icon).toBe("BASE");
      expect(result.definitiveRender?.icon).toBe("BASE_ONLY");
    });

    it("should handle missing intermediate steps gracefully", async () => {
      const baseTheme: ReactThemeConfig = {
        reconciled: {
          lightMode: { text: "#aaaaaa" },
          darkMode: { text: "#bbbbbb" },
        },
      };

      const darkOverride: ReactThemeConfig = {
        reconciled: {
          darkMode: { text: "#cccccc" },
        },
      };

      // Skip light override file
      writeFileSync(
        join(testDir, "react-theme.json"),
        JSON.stringify(baseTheme)
      );
      writeFileSync(
        join(testDir, "react-theme-dark.json"),
        JSON.stringify(darkOverride)
      );

      const result = await loadThemeFiles(testDir);

      expect(result.reconciled?.lightMode).toEqual({ text: "#aaaaaa" });
      expect(result.reconciled?.darkMode).toEqual({ text: "#cccccc" });
    });
  });

  describe("Error handling", () => {
    it("should handle invalid JSON gracefully and log warning", async () => {
      const loggerWarnSpy = vi.spyOn(internalLogger, "warn").mockImplementation(() => {});

      writeFileSync(join(testDir, "react-theme.json"), "{ invalid json }");

      // Should return empty object rather than throwing
      const result = await loadThemeFiles(testDir);

      expect(result).toEqual({});
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[ReactTracer] Warning: Failed to parse theme file"),
        expect.any(String)
      );

      loggerWarnSpy.mockRestore();
    });

    it("should handle non-existent directory gracefully", async () => {
      const nonExistentDir = join(process.cwd(), `does-not-exist-${  Date.now()}`);

      const result = await loadThemeFiles(nonExistentDir);

      expect(result).toEqual({});
    });

    it("should ignore non-JSON files matching pattern", async () => {
      const theme: ReactThemeConfig = {
        definitiveRender: { icon: "✓" },
      };

      writeFileSync(join(testDir, "react-theme.json"), JSON.stringify(theme));
      writeFileSync(join(testDir, "react-theme.txt"), "not json");
      writeFileSync(join(testDir, "react-theme-light.md"), "# Not JSON");

      const result = await loadThemeFiles(testDir);

      // Should only load the valid .json file
      expect(result).toEqual(theme);
    });
  });

  describe("Deep merging behavior", () => {
    it("should deep merge nested properties without losing sibling keys", async () => {
      const baseTheme: ReactThemeConfig = {
        errorStatements: {
          lightMode: { text: "#ff0000", bold: true },
          darkMode: { text: "#ff8888", bold: true },
          icon: "❌",
        },
      };

      const lightOverride: ReactThemeConfig = {
        errorStatements: {
          lightMode: {
            background: "#fff0f0",
            // text and bold should be preserved from base
          },
        },
      };

      writeFileSync(
        join(testDir, "react-theme.json"),
        JSON.stringify(baseTheme)
      );
      writeFileSync(
        join(testDir, "react-theme-light.json"),
        JSON.stringify(lightOverride)
      );

      const result = await loadThemeFiles(testDir);

      expect(result.errorStatements?.lightMode).toEqual({
        text: "#ff0000",
        bold: true,
        background: "#fff0f0",
      });
      expect(result.errorStatements?.darkMode).toEqual({
        text: "#ff8888",
        bold: true,
      });
      expect(result.errorStatements?.icon).toBe("❌");
    });
  });
});
