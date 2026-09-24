import { describe, expect, it } from "vitest";
import { getLogger } from "../../../../src/lib/registry/getLogger";

describe("getLogger", () => {
  // Note: We can't truly reset the registry between tests since it's a module-level Map,
  // but we can test that same names return same instances

  describe("lazy creation", () => {
    it("should create logger on first access", () => {
      const logger = getLogger("test-lazy");
      expect(logger).toBeDefined();
    });

    it("should create logger with correct name", () => {
      const logger = getLogger("my-app");
      // Name is private, but we can verify it's a logger instance
      expect(logger).toHaveProperty("setLogLevel");
      expect(logger).toHaveProperty("setTheme");
      expect(logger).toHaveProperty("setShowName");
    });
  });

  describe("singleton behavior", () => {
    it("should return same instance for same name", () => {
      const logger1 = getLogger("singleton-test");
      const logger2 = getLogger("singleton-test");
      expect(logger1).toBe(logger2);
    });

    it("should return different instances for different names", () => {
      const logger1 = getLogger("app1");
      const logger2 = getLogger("app2");
      expect(logger1).not.toBe(logger2);
    });

    it("should be case-sensitive", () => {
      const logger1 = getLogger("App");
      const logger2 = getLogger("app");
      expect(logger1).not.toBe(logger2);
    });
  });

  describe("configuration persistence", () => {
    it("should persist configuration across multiple getLogger calls", () => {
      const logger1 = getLogger("persist-test");
      logger1.setLogLevel("debug");

      const logger2 = getLogger("persist-test");
      // Both are same instance, so logger2 should also have debug level
      // We can't directly check the private level, but we can verify it's the same instance
      expect(logger2).toBe(logger1);
    });

    it("should not share configuration between different loggers", () => {
      const logger1 = getLogger("config1");
      const logger2 = getLogger("config2");

      logger1.setLogLevel("debug");
      logger2.setLogLevel("error");

      // Verify they are different instances
      expect(logger1).not.toBe(logger2);
    });
  });

  describe("multiple loggers", () => {
    it("should handle many loggers simultaneously", () => {
      const loggers = [
        getLogger("app"),
        getLogger("database"),
        getLogger("api"),
        getLogger("auth"),
        getLogger("cache"),
      ];

      // All should be defined
      loggers.forEach((logger) => {
        expect(logger).toBeDefined();
      });

      // All should be unique
      const uniqueLoggers = new Set(loggers);
      expect(uniqueLoggers.size).toBe(loggers.length);
    });

    it("should retrieve correct logger from registry", () => {
      const app = getLogger("app");
      const db = getLogger("database");
      const api = getLogger("api");

      // Retrieve again
      const app2 = getLogger("app");
      const db2 = getLogger("database");
      const api2 = getLogger("api");

      expect(app2).toBe(app);
      expect(db2).toBe(db);
      expect(api2).toBe(api);
    });
  });
});
