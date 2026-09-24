import { beforeEach, describe, expect, it, vi } from "vitest";
import { setTheme } from "../../../../src/lib/functions/state/setTheme";
import { setGroupMode } from "../../../../src/lib/functions/state/setGroupMode";
import { setLogLevel } from "../../../../src/lib/functions/state/setLogLevel";
import { group } from "../../../../src/lib/functions/grouping/group";
import { groupEnd } from "../../../../src/lib/functions/grouping/groupEnd";
import { debug } from "../../../../src/lib/functions/logging/debug";
import { info } from "../../../../src/lib/functions/logging/info";
import { log } from "../../../../src/lib/functions/logging/log";
import { resetDepth } from "../../../../src/lib/functions/state/groupDepth";

describe("logging indentation in text mode", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let consoleLogSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let consoleInfoSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    resetDepth();
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    setLogLevel("trace");
    setTheme({ colors: {}, prefixes: {} });
    setGroupMode("text");
  });

  it("should indent debug messages inside a group", () => {
    group("outer");
    debug("inner message");

    // Both group and debug go to console.log
    const calls = consoleLogSpy.mock.calls.map((call: unknown[]) => {
      return call[0] as string;
    });
    expect(calls[0]).toBe("├─ outer");
    expect(calls[1]).toBe("│  inner message");
  });

  it("should indent info messages inside a group", () => {
    group("outer");
    info("inner message");

    expect(consoleInfoSpy).toHaveBeenCalledWith("│  inner message");
  });

  it("should indent log messages inside a group", () => {
    group("outer");
    log("inner message");

    const calls = consoleLogSpy.mock.calls.map((call: unknown[]) => {
      return call[0] as string;
    });
    expect(calls[0]).toBe("├─ outer");
    expect(calls[1]).toBe("│  inner message");
  });

  it("should handle nested groups with progressive indentation", () => {
    group("level 0");
    debug("message at depth 1");

    group("level 1");
    debug("message at depth 2");

    group("level 2");
    debug("message at depth 3");

    // Both group and debug go to console.log
    const logCalls = consoleLogSpy.mock.calls.map((call: unknown[]) => {
      return call[0] as string;
    });

    expect(logCalls[0]).toBe("├─ level 0");
    expect(logCalls[1]).toBe("│  message at depth 1");
    expect(logCalls[2]).toBe("│  ├─ level 1");
    expect(logCalls[3]).toBe("│  │  message at depth 2");
    expect(logCalls[4]).toBe("│  │  ├─ level 2");
    expect(logCalls[5]).toBe("│  │  │  message at depth 3");
  });

  it("should reduce indentation after groupEnd", () => {
    group("outer");
    debug("inside outer");

    group("inner");
    debug("inside inner");
    groupEnd();

    debug("back in outer");
    groupEnd();

    debug("at root");

    // Both group and debug go to console.log
    const logCalls = consoleLogSpy.mock.calls.map((call: unknown[]) => {
      return call[0] as string;
    });

    expect(logCalls[0]).toBe("├─ outer");
    expect(logCalls[1]).toBe("│  inside outer");
    expect(logCalls[2]).toBe("│  ├─ inner");
    expect(logCalls[3]).toBe("│  │  inside inner");
    expect(logCalls[4]).toBe("│  back in outer");
    expect(logCalls[5]).toBe("at root");
  });

  it("should not indent in default mode (console.group)", () => {
    setTheme({ colors: {}, prefixes: {} });
    setGroupMode("default");
    const consoleGroupSpy = vi
      .spyOn(console, "group")
      .mockImplementation(() => {});

    group("outer");
    debug("inner message");

    expect(consoleGroupSpy).toHaveBeenCalledWith("outer");

    // In default mode, debug goes to console.log with no indentation
    expect(consoleLogSpy).toHaveBeenCalledWith("inner message");
  });

  it("should handle messages with existing prefixes and colors", () => {
    setTheme({
      colors: { debug: "#00ff00" },
      prefixes: { debug: "[DEBUG]" },
    });
    setGroupMode("text");

    group("outer");
    debug("test message");

    // Debug goes to console.log
    const logCalls = consoleLogSpy.mock.calls;

    // Should have indentation + prefix in the formatted message
    // Format: "│  %c[DEBUG] test message" (depth markers are outside the %c formatting)
    expect(logCalls[1]?.[0]).toContain("│  %c[DEBUG] test message");
  });
});
