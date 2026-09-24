import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLogger } from "../../../src/lib/registry/getLogger";
import { themes } from "../../../src/lib/themes";

describe("Logger logging methods", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("all 8 log levels", () => {
    it("should have fatal method", () => {
      const logger = getLogger("test-fatal");
      expect(logger.fatal).toBeTypeOf("function");
    });

    it("should have error method", () => {
      const logger = getLogger("test-error");
      expect(logger.error).toBeTypeOf("function");
    });

    it("should have warn method", () => {
      const logger = getLogger("test-warn");
      expect(logger.warn).toBeTypeOf("function");
    });

    it("should have log method", () => {
      const logger = getLogger("test-log");
      expect(logger.log).toBeTypeOf("function");
    });

    it("should have info method", () => {
      const logger = getLogger("test-info");
      expect(logger.info).toBeTypeOf("function");
    });

    it("should have debug method", () => {
      const logger = getLogger("test-debug");
      expect(logger.debug).toBeTypeOf("function");
    });

    it("should have verbose method", () => {
      const logger = getLogger("test-verbose");
      expect(logger.verbose).toBeTypeOf("function");
    });

    it("should have trace method", () => {
      const logger = getLogger("test-trace");
      expect(logger.trace).toBeTypeOf("function");
    });
  });

  describe("name prefix", () => {
    it("should prepend logger name when showName is true", () => {
      const spy = vi.spyOn(console, "error");
      const logger = getLogger("app");
      logger.setLogLevel("fatal");
      logger.setShowName(true);

      logger.fatal("test message");

      expect(spy).toHaveBeenCalled();
      const calls = spy.mock.calls;
      function containsAppPrefix(call: unknown[]): boolean {
        return call.some((arg) => {
          return typeof arg === "string" && arg.includes("[app]");
        });
      }
      const hasNamePrefix = calls.some(containsAppPrefix);
      expect(hasNamePrefix).toBe(true);
      spy.mockRestore();
    });

    it("should not prepend logger name when showName is false", () => {
      const spy = vi.spyOn(console, "error");
      const logger = getLogger("hidden");
      logger.setLogLevel("fatal");
      logger.setShowName(false);

      logger.fatal("test message");

      expect(spy).toHaveBeenCalled();
      const calls = spy.mock.calls;
      function containsHiddenPrefix(call: unknown[]): boolean {
        return call.some((arg) => {
          return typeof arg === "string" && arg.includes("[hidden]");
        });
      }
      const hasNamePrefix = calls.some(containsHiddenPrefix);
      expect(hasNamePrefix).toBe(false);
      spy.mockRestore();
    });
  });

  describe("log level filtering", () => {
    it("should output when message level <= current level", () => {
      const spy = vi.spyOn(console, "log");
      const logger = getLogger("level-test-1");
      logger.setLogLevel("log");

      logger.log("should appear");

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it("should suppress when message level > current level", () => {
      const spy = vi.spyOn(console, "log");
      const logger = getLogger("level-test-2");
      logger.setLogLevel("error");

      logger.log("should not appear");

      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe("theme application", () => {
    it("should apply emoji theme", () => {
      const spy = vi.spyOn(console, "error");
      const logger = getLogger("emoji-test");
      logger.setLogLevel("error");
      logger.setTheme(themes.emoji);

      logger.error("test");

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it("should apply minimal theme", () => {
      const spy = vi.spyOn(console, "warn");
      const logger = getLogger("minimal-test");
      logger.setLogLevel("warn");
      logger.setTheme(themes.minimal);

      logger.warn("test");

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe("group methods", () => {
    it("should have group method", () => {
      const logger = getLogger("group-test");
      expect(logger.group).toBeTypeOf("function");
    });

    it("should have groupEnd method", () => {
      const logger = getLogger("groupend-test");
      expect(logger.groupEnd).toBeTypeOf("function");
    });

    it("should call console.group in default mode", () => {
      const spy = vi.spyOn(console, "group");
      const logger = getLogger("group-default");
      logger.setTheme(themes.default);
      logger.setLogLevel("log");

      logger.group("test group");

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe("enter/exit methods", () => {
    it("should have enter method", () => {
      const logger = getLogger("enter-test");
      expect(logger.enter).toBeTypeOf("function");
    });

    it("should have exit method", () => {
      const logger = getLogger("exit-test");
      expect(logger.exit).toBeTypeOf("function");
    });

    it("should return ExitHandle from enter", () => {
      const logger = getLogger("handle-test");
      logger.setLogLevel("trace");

      const handle = logger.enter("test");

      expect(handle).toHaveProperty("label");
      expect(handle).toHaveProperty("startTime");
      expect(handle).toHaveProperty("level");
    });

    it("should measure elapsed time on exit", () => {
      const spy = vi.spyOn(console, "log");
      const logger = getLogger("timing-test");
      logger.setLogLevel("trace");

      const handle = logger.enter("test");
      logger.exit(handle);

      expect(spy).toHaveBeenCalled();
      const calls = spy.mock.calls;
      function containsElapsed(call: unknown[]): boolean {
        return call.some((arg) => {
          return typeof arg === "string" && arg.includes("elapsed");
        });
      }
      const hasElapsed = calls.some(containsElapsed);
      expect(hasElapsed).toBe(true);
      spy.mockRestore();
    });
  });

  describe("independent logger instances", () => {
    it("should maintain separate state for different loggers", () => {
      const logger1 = getLogger("independent-1");
      const logger2 = getLogger("independent-2");

      logger1.setLogLevel("debug");
      logger2.setLogLevel("error");

      const spy1 = vi.spyOn(console, "log");
      logger1.debug("should appear");
      expect(spy1).toHaveBeenCalled();
      spy1.mockRestore();

      const spy2 = vi.spyOn(console, "log");
      logger2.debug("should not appear");
      expect(spy2).not.toHaveBeenCalled();
      spy2.mockRestore();
    });
  });
});
