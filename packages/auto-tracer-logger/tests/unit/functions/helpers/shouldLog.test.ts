import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LogLevel } from "@src/lib/types/LogLevel";

describe("shouldLog", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should return true when message level equals current level", async () => {
    const { setLogLevel } = await import(
      "@src/lib/functions/state/setLogLevel.js"
    );
    const { shouldLog } = await import(
      "@src/lib/functions/helpers/shouldLog.js"
    );

    setLogLevel("info");

    expect(shouldLog("info")).toBe(true);
  });

  it("should return true when message level is less verbose than current level", async () => {
    const { setLogLevel } = await import(
      "@src/lib/functions/state/setLogLevel.js"
    );
    const { shouldLog } = await import(
      "@src/lib/functions/helpers/shouldLog.js"
    );

    setLogLevel("trace");

    expect(shouldLog("fatal")).toBe(true);
    expect(shouldLog("error")).toBe(true);
    expect(shouldLog("warn")).toBe(true);
    expect(shouldLog("log")).toBe(true);
    expect(shouldLog("info")).toBe(true);
    expect(shouldLog("debug")).toBe(true);
    expect(shouldLog("verbose")).toBe(true);
  });

  it("should return false when message level is more verbose than current level", async () => {
    const { setLogLevel } = await import(
      "@src/lib/functions/state/setLogLevel.js"
    );
    const { shouldLog } = await import(
      "@src/lib/functions/helpers/shouldLog.js"
    );

    setLogLevel("warn");

    expect(shouldLog("log")).toBe(false);
    expect(shouldLog("info")).toBe(false);
    expect(shouldLog("debug")).toBe(false);
    expect(shouldLog("verbose")).toBe(false);
    expect(shouldLog("trace")).toBe(false);
  });

  it("should respect log level hierarchy", async () => {
    const { setLogLevel } = await import(
      "@src/lib/functions/state/setLogLevel.js"
    );
    const { shouldLog } = await import(
      "@src/lib/functions/helpers/shouldLog.js"
    );

    const testCases: Array<{
      currentLevel: LogLevel;
      messageLevel: LogLevel;
      expected: boolean;
    }> = [
      { currentLevel: "fatal", messageLevel: "fatal", expected: true },
      { currentLevel: "fatal", messageLevel: "error", expected: false },
      { currentLevel: "error", messageLevel: "fatal", expected: true },
      { currentLevel: "error", messageLevel: "error", expected: true },
      { currentLevel: "error", messageLevel: "warn", expected: false },
      { currentLevel: "log", messageLevel: "warn", expected: true },
      { currentLevel: "log", messageLevel: "info", expected: false },
      { currentLevel: "debug", messageLevel: "verbose", expected: false },
      { currentLevel: "verbose", messageLevel: "debug", expected: true },
      { currentLevel: "trace", messageLevel: "trace", expected: true },
    ];

    for (const { currentLevel, messageLevel, expected } of testCases) {
      setLogLevel(currentLevel);
      expect(shouldLog(messageLevel)).toBe(expected);
    }
  });
});
