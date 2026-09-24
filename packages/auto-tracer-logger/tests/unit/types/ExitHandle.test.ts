import { describe, expect, it } from "vitest";
import type { ExitHandle } from "@src/lib/types/ExitHandle";

describe("ExitHandle", () => {
  it("should have required properties", () => {
    const handle: ExitHandle = {
      label: "test",
      startTime: Date.now(),
      level: "trace",
    };

    expect(handle.label).toBe("test");
    expect(handle.startTime).toBeTypeOf("number");
    expect(handle.level).toBe("trace");
  });

  it("should accept all valid log levels", () => {
    const levels: ExitHandle["level"][] = [
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
      const handle: ExitHandle = {
        label: "test",
        startTime: 1000,
        level,
      };
      expect(handle.level).toBe(level);
    });
  });
});
