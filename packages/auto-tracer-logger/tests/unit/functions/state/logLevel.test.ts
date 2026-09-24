import { beforeEach, describe, expect, it, vi } from "vitest";

describe("setLogLevel and getLogLevel", () => {
  beforeEach(async () => {
    // Reset modules to clear state between tests
    vi.resetModules();
  });

  it("should have default log level of 'log'", async () => {
    const { getLogLevel } = await import("@src/lib/functions/state/getLogLevel.js");

    expect(getLogLevel()).toBe("log");
  });

  it("should set and get log level", async () => {
    const { setLogLevel } = await import("@src/lib/functions/state/setLogLevel.js");
    const { getLogLevel } = await import("@src/lib/functions/state/getLogLevel.js");

    setLogLevel("debug");

    expect(getLogLevel()).toBe("debug");
  });

  it("should accept all valid log levels", async () => {
    const { setLogLevel } = await import("@src/lib/functions/state/setLogLevel.js");
    const { getLogLevel } = await import("@src/lib/functions/state/getLogLevel.js");

    const levels: Array<"fatal" | "error" | "warn" | "log" | "info" | "debug" | "verbose" | "trace"> = [
      "fatal",
      "error",
      "warn",
      "log",
      "info",
      "debug",
      "verbose",
      "trace",
    ];

    for (const level of levels) {
      setLogLevel(level);
      expect(getLogLevel()).toBe(level);
    }
  });
});
