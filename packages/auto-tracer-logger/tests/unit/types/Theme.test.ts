import { describe, expect, it } from "vitest";
import type { Theme } from "@src/lib/types/Theme";

describe("Theme", () => {
  it("should accept all color properties", () => {
    const theme: Theme = {
      colors: {
        fatal: "#ff0000",
        error: "#ff4400",
        warn: "#ffaa00",
        log: "#ffffff",
        info: "#00aaff",
        debug: "#00ff00",
        verbose: "#aa00ff",
        trace: "#888888",
      },
      prefixes: {},
    };

    expect(theme.colors.fatal).toBe("#ff0000");
    expect(theme.colors.error).toBe("#ff4400");
    expect(theme.colors.warn).toBe("#ffaa00");
    expect(theme.colors.log).toBe("#ffffff");
    expect(theme.colors.info).toBe("#00aaff");
    expect(theme.colors.debug).toBe("#00ff00");
    expect(theme.colors.verbose).toBe("#aa00ff");
    expect(theme.colors.trace).toBe("#888888");
  });

  it("should accept all prefix properties", () => {
    const theme: Theme = {
      colors: {},
      prefixes: {
        fatal: "🔥",
        error: "💥",
        warn: "⚠️",
        log: "📝",
        info: "ℹ️",
        debug: "🐛",
        verbose: "📊",
        trace: "🔍",
        enter: "▶",
        exit: "◀",
      },
    };

    expect(theme.prefixes.fatal).toBe("🔥");
    expect(theme.prefixes.error).toBe("💥");
    expect(theme.prefixes.warn).toBe("⚠️");
    expect(theme.prefixes.log).toBe("📝");
    expect(theme.prefixes.info).toBe("ℹ️");
    expect(theme.prefixes.debug).toBe("🐛");
    expect(theme.prefixes.verbose).toBe("📊");
    expect(theme.prefixes.trace).toBe("🔍");
    expect(theme.prefixes.enter).toBe("▶");
    expect(theme.prefixes.exit).toBe("◀");
  });

  it("should allow partial colors and prefixes", () => {
    const theme: Theme = {
      colors: {
        error: "red",
      },
      prefixes: {
        enter: "→",
        exit: "←",
      },
    };

    expect(theme.colors.error).toBe("red");
    expect(theme.prefixes.enter).toBe("→");
    expect(theme.prefixes.exit).toBe("←");
  });
});
