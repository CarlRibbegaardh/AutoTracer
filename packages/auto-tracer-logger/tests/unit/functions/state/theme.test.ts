import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Theme } from "@src/lib/types/Theme";

describe("setTheme and getTheme", () => {
  beforeEach(async () => {
    // Reset modules to clear state between tests
    vi.resetModules();
  });

  it("should have a default theme", async () => {
    const { getTheme } = await import("@src/lib/functions/state/getTheme.js");

    const theme = getTheme();

    expect(theme).toBeDefined();
    expect(theme.colors).toBeDefined();
    expect(theme.prefixes).toBeDefined();
  });

  it("should set and get theme", async () => {
    const { setTheme } = await import("@src/lib/functions/state/setTheme.js");
    const { getTheme } = await import("@src/lib/functions/state/getTheme.js");

    const customTheme: Theme = {
      colors: { error: "#ff0000" },
      prefixes: { error: "!" },
    };

    setTheme(customTheme);

    expect(getTheme()).toEqual(customTheme);
  });

  it("should replace entire theme when set", async () => {
    const { setTheme } = await import("@src/lib/functions/state/setTheme.js");
    const { getTheme } = await import("@src/lib/functions/state/getTheme.js");

    const theme1: Theme = {
      colors: { error: "red", warn: "yellow" },
      prefixes: { error: "E" },
    };

    const theme2: Theme = {
      colors: { info: "blue" },
      prefixes: { info: "I" },
    };

    setTheme(theme1);
    setTheme(theme2);

    const result = getTheme();
    expect(result).toEqual(theme2);
    expect(result.colors.error).toBeUndefined();
  });
});
