import { beforeEach, describe, expect, it, vi } from "vitest";
import { exit } from "../../../../src/lib/functions/tracking/exit";
import { enter } from "../../../../src/lib/functions/tracking/enter";
import { setLogLevel } from "../../../../src/lib/functions/state/setLogLevel";
import { setTheme } from "../../../../src/lib/functions/state/setTheme";
import { themes } from "../../../../src/lib/themes";

describe("exit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    setLogLevel("trace");
  });

  it("should handle normal exit when handle is at top of stack", () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const groupEndSpy = vi
      .spyOn(console, "groupEnd")
      .mockImplementation(() => {});

    const handle = enter("test operation", "trace");
    exit(handle);

    // Find the exit message (contains elapsed time)
    const calls = consoleLogSpy.mock.calls;
    const exitCall = calls.find((call) => {
      const msg = call[0] as string;
      return msg.includes("elapsed");
    });

    expect(exitCall).toBeDefined();
    expect(exitCall![0]).toContain("test operation");
    expect(exitCall![0]).toContain("elapsed");
    expect(groupEndSpy).toHaveBeenCalled();
  });

  it("should warn when handle is not found in stack", () => {
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    const fakeHandle = {
      label: "unknown",
      startTime: performance.now(),
      level: "trace" as const,
    };

    exit(fakeHandle);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Tried to exit previously entered item "unknown"')
    );
  });

  it("should unwind stack when handle is not at top", () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    const groupEndSpy = vi
      .spyOn(console, "groupEnd")
      .mockImplementation(() => {});

    const handle1 = enter("operation 1", "trace");
    enter("operation 2", "trace");
    enter("operation 3", "trace");

    // Exit handle1 instead of handle3 - should unwind 3 and 2
    exit(handle1);

    const warnMessage = consoleWarnSpy.mock.calls[0]?.[0] as string;
    expect(warnMessage).toContain(
      'Expected to exit previously entered item "operation 3"'
    );
    expect(warnMessage).toContain(
      'but the code asked to exit item "operation 1"'
    );
    expect(warnMessage).toContain("Unwinding stack");

    // Should output exit messages for all three operations
    // Find calls with elapsed time in them
    const calls = consoleLogSpy.mock.calls;
    const exitCalls = calls.filter((call) => {
      const msg = call[0] as string;
      return msg && msg.includes("elapsed");
    });

    expect(exitCalls.length).toBe(3);
    expect(
      exitCalls.some((call) => {
        return (call[0] as string).includes("operation 3");
      })
    ).toBe(true);
    expect(
      exitCalls.some((call) => {
        return (call[0] as string).includes("operation 2");
      })
    ).toBe(true);
    expect(
      exitCalls.some((call) => {
        return (call[0] as string).includes("operation 1");
      })
    ).toBe(true);

    // groupEnd should be called for each
    expect(groupEndSpy).toHaveBeenCalledTimes(3);
  });

  it("should handle double exit gracefully", () => {
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    const handle = enter("test", "trace");
    exit(handle);

    // Try to exit same handle again
    exit(handle);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Tried to exit previously entered item "test"')
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("but it's not in the stack.")
    );
  });

  it("should handle exit after unwind", () => {
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    const handle1 = enter("op1", "trace");
    const handle2 = enter("op2", "trace");
    enter("op3", "trace");

    // Unwind to handle1
    exit(handle1);

    // Try to exit handle2 or handle3 - should warn
    exit(handle2);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Tried to exit previously entered item "op2"')
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("but it's not in the stack.")
    );
  });

  it("should respect log level when outputting exit messages", () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    setLogLevel("fatal"); // Only fatal messages

    const handle = enter("test", "trace");
    exit(handle);

    // Exit message should not be logged because level is trace but we're at fatal
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it("should output all intermediate exits during unwinding", () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});

    enter("op1", "trace");
    const handle2 = enter("op2", "trace");
    enter("op3", "trace");
    enter("op4", "trace");

    consoleLogSpy.mockClear();

    // Exit handle2 - should unwind 4, 3, and 2
    exit(handle2);

    // Verify all three exits were output
    const calls = consoleLogSpy.mock.calls.map((call) => {
      return call[0];
    });
    expect(
      calls.some((msg: string) => {
        return msg.includes("op4");
      })
    ).toBe(true);
    expect(
      calls.some((msg: string) => {
        return msg.includes("op3");
      })
    ).toBe(true);
    expect(
      calls.some((msg: string) => {
        return msg.includes("op2");
      })
    ).toBe(true);
  });

  it("should measure elapsed time for exit messages", () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "groupEnd").mockImplementation(() => {});

    const handle = enter("timed operation", "trace");

    // Simulate some work
    const startPerf = performance.now();
    while (performance.now() - startPerf < 5) {
      // Wait at least 5ms
    }

    exit(handle);

    const lastCall =
      consoleLogSpy.mock.calls[consoleLogSpy.mock.calls.length - 1];
    if (lastCall && lastCall[0]) {
      const exitMessage = lastCall[0] as string;
      expect(exitMessage).toContain("elapsed");
      expect(exitMessage).toMatch(/\d+\.\d{2}ms/);
    }
  });

  it("should apply theme styling to exit messages", () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "groupEnd").mockImplementation(() => {});

    setTheme(themes.emoji);

    const handle = enter("styled operation", "trace");
    exit(handle);

    // Check if theme styling was applied (emoji theme has exit prefix)
    const calls = consoleLogSpy.mock.calls;
    const hasStyledCall = calls.some((call) => {
      return call[0] && typeof call[0] === "string" && call[0].includes("%c");
    });

    expect(hasStyledCall).toBe(true);
  });

  it("should preserve CSS styling from enter() in exit() elapsed message", () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "groupEnd").mockImplementation(() => {});

    // Call enter with custom CSS styling (like FlowTracer does)
    const handle = enter("%c→ testFunction", "font-weight: bold");
    exit(handle);

    // Find the exit message (contains elapsed time)
    const exitCall = consoleLogSpy.mock.calls.find((call) => {
      const msg = call[0] as string;
      return msg && msg.includes("elapsed");
    });

    expect(exitCall).toBeDefined();

    const message = exitCall![0] as string;
    const cssArg = exitCall![1];

    // BUG: The exit message has %c but no CSS argument!
    // The message should be: "%c→ testFunction (elapsed: X.XXms)"
    // And there should be a CSS argument: "font-weight: bold"

    if (message.includes("%c")) {
      // If message has %c formatter, it MUST have a CSS argument
      expect(cssArg).toBeDefined();
      expect(typeof cssArg).toBe("string");
      expect(cssArg).toContain("font-weight: bold");
    }
  });
});
