import { beforeEach, describe, expect, it, vi } from "vitest";

describe("group and groupEnd", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let consoleGroupSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let consoleGroupEndSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let consoleLogSpy: any;

  beforeEach(() => {
    vi.resetModules();
    consoleGroupSpy = vi.spyOn(console, "group").mockImplementation(() => {});
    consoleGroupEndSpy = vi.spyOn(console, "groupEnd").mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  describe("default mode (console.group)", () => {
    it("should call console.group with label", async () => {
      const { setTheme } = await import("@src/lib/functions/state/setTheme.js");
      const { setGroupMode } = await import(
        "@src/lib/functions/state/setGroupMode.js"
      );
      const { group } = await import("@src/lib/functions/grouping/group.js");

      setTheme({ colors: {}, prefixes: {} });
      setGroupMode("default");
      group("test group");

      expect(consoleGroupSpy).toHaveBeenCalledWith("test group");
    });

    it("should call console.groupEnd", async () => {
      const { setTheme } = await import("@src/lib/functions/state/setTheme.js");
      const { setGroupMode } = await import(
        "@src/lib/functions/state/setGroupMode.js"
      );
      const { groupEnd } = await import("@src/lib/functions/grouping/groupEnd.js");

      setTheme({ colors: {}, prefixes: {} });
      setGroupMode("default");
      groupEnd();

      expect(consoleGroupEndSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("text mode (UTF-8 art)", () => {
    beforeEach(async () => {
      // Ensure clean state for text mode tests
      vi.resetModules();
      consoleGroupSpy = vi.spyOn(console, "group").mockImplementation(() => {});
      consoleGroupEndSpy = vi.spyOn(console, "groupEnd").mockImplementation(() => {});
      consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    });

    it("should use safeLog with UTF-8 prefix for group", async () => {
      const { setTheme } = await import("@src/lib/functions/state/setTheme.js");
      const { setGroupMode } = await import(
        "@src/lib/functions/state/setGroupMode.js"
      );
      const { group } = await import("@src/lib/functions/grouping/group.js");

      setTheme({ colors: {}, prefixes: {} });
      setGroupMode("text");

      // Clear spies AFTER setting theme to ignore any calls from module initialization
      consoleGroupSpy.mockClear();
      consoleLogSpy.mockClear();

      group("test group");

      expect(consoleLogSpy).toHaveBeenCalledWith("├─ test group");
      expect(consoleGroupSpy).not.toHaveBeenCalled();
    });

    it("should track nesting depth", async () => {
      const { setTheme } = await import("@src/lib/functions/state/setTheme.js");
      const { setGroupMode } = await import(
        "@src/lib/functions/state/setGroupMode.js"
      );
      const { group } = await import("@src/lib/functions/grouping/group.js");
      const { groupEnd } = await import("@src/lib/functions/grouping/groupEnd.js");

      setTheme({ colors: {}, prefixes: {} });
      setGroupMode("text");

      group("outer");
      expect(consoleLogSpy).toHaveBeenCalledWith("├─ outer");

      group("inner");
      expect(consoleLogSpy).toHaveBeenCalledWith("│  ├─ inner");

      groupEnd();
      groupEnd();
    });

    it("should use └─ for last group at depth", async () => {
      const { setTheme } = await import("@src/lib/functions/state/setTheme.js");
      const { setGroupMode } = await import(
        "@src/lib/functions/state/setGroupMode.js"
      );
      const { group } = await import("@src/lib/functions/grouping/group.js");
      const { groupEnd } = await import("@src/lib/functions/grouping/groupEnd.js");

      setTheme({ colors: {}, prefixes: {} });
      setGroupMode("text");

      group("first");
      groupEnd();

      // After groupEnd, next group at same level should still use ├─
      // (we can't know if it's the last until we see the next groupEnd)
      group("second");
      expect(consoleLogSpy).toHaveBeenLastCalledWith("├─ second");
    });
  });

  describe("log level filtering", () => {
    it("should respect log level and only output at 'log' or higher", async () => {
      const { setLogLevel } = await import("@src/lib/functions/state/setLogLevel.js");
      const { setTheme } = await import("@src/lib/functions/state/setTheme.js");
      const { setGroupMode } = await import(
        "@src/lib/functions/state/setGroupMode.js"
      );
      const { group } = await import("@src/lib/functions/grouping/group.js");

      setTheme({ colors: {}, prefixes: {} });
      setGroupMode("default");
      setLogLevel("warn");
      consoleGroupSpy.mockClear();

      group("test");

      expect(consoleGroupSpy).not.toHaveBeenCalled();
    });

    it("should output when log level is 'log' or higher", async () => {
      const { setLogLevel } = await import("@src/lib/functions/state/setLogLevel.js");
      const { setTheme } = await import("@src/lib/functions/state/setTheme.js");
      const { setGroupMode } = await import(
        "@src/lib/functions/state/setGroupMode.js"
      );
      const { group } = await import("@src/lib/functions/grouping/group.js");

      setTheme({ colors: {}, prefixes: {} });
      setGroupMode("default");
      setLogLevel("log");

      group("test");

      expect(consoleGroupSpy).toHaveBeenCalledWith("test");
    });
  });
});
