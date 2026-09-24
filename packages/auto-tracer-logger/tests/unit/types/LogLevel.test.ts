import { describe, expect, it } from "vitest";
import type { LogLevel } from "@src/lib/types/LogLevel";

describe("LogLevel", () => {
  it("should accept all valid log level values", () => {
    const levels: LogLevel[] = [
      "fatal",
      "error",
      "warn",
      "log",
      "info",
      "debug",
      "verbose",
      "trace",
    ];

    levels.forEach((level) => {
      expect(level).toBeDefined();
    });
  });

  it("should be assignable to string", () => {
    const level: LogLevel = "info";
    const str: string = level;
    expect(str).toBe("info");
  });
});
