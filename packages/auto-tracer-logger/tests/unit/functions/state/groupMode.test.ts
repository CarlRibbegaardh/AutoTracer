import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Theme } from "@src/lib/types/Theme";

describe("setGroupMode and getGroupMode", () => {
  beforeEach(async () => {
    vi.resetModules();
  });

  it("should have a default group mode", async () => {
    const { getGroupMode } =
      await import("@src/lib/functions/state/getGroupMode.js");

    expect(getGroupMode()).toBe("default");
  });

  it("should set and get group mode", async () => {
    const { setGroupMode } =
      await import("@src/lib/functions/state/setGroupMode.js");
    const { getGroupMode } =
      await import("@src/lib/functions/state/getGroupMode.js");

    setGroupMode("text");

    expect(getGroupMode()).toBe("text");
  });

  it("should not change group mode when theme is set", async () => {
    const { setGroupMode } =
      await import("@src/lib/functions/state/setGroupMode.js");
    const { getGroupMode } =
      await import("@src/lib/functions/state/getGroupMode.js");
    const { setTheme } = await import("@src/lib/functions/state/setTheme.js");

    const customTheme: Theme = {
      colors: {},
      prefixes: {},
    };

    setGroupMode("text");
    setTheme(customTheme);

    expect(getGroupMode()).toBe("text");
  });
});
