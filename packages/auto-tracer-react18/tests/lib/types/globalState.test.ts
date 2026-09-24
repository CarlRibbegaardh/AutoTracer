import { describe, expect, it, vi } from "vitest";
import {
  isDarkMode,
  getIsGlobalTracerInstalled,
  getTraceOptions,
  renderStartTime,
  setIsGlobalTracerInstalled,
  setRenderStartTime,
  setTracerOptions,
} from "@src/lib/types/globalState";// Mock window.matchMedia for testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  }),
});

describe("globalState", () => {
  describe("isDarkMode", () => {
    it("should return false when matchMedia returns false", () => {
      window.matchMedia = vi.fn().mockImplementation(() => {
        return {
          matches: false
        };
      });

      expect(isDarkMode()).toBe(false);
    });

    it("should return true when matchMedia returns true", () => {
      window.matchMedia = vi.fn().mockImplementation(() => {
        return {
          matches: true
        };
      });

      expect(isDarkMode()).toBe(true);
    });

    it("should handle matchMedia errors gracefully", () => {
      window.matchMedia = vi.fn().mockImplementation(() => {
        throw new Error("matchMedia error");
      });

      expect(isDarkMode()).toBe(false);
    });
  });

  describe("global state management", () => {
    it("should have initial values", () => {
      expect(typeof getIsGlobalTracerInstalled()).toBe("boolean");
      expect(typeof renderStartTime).toBe("number");
      expect(typeof getTraceOptions()).toBe("object");
    });

    it("should allow setting global tracer installed state", () => {
      setIsGlobalTracerInstalled(true);
      expect(getIsGlobalTracerInstalled()).toBe(true);

      setIsGlobalTracerInstalled(false);
      expect(getIsGlobalTracerInstalled()).toBe(false);
    });

    it("should allow setting render start time", () => {
      const testTime = 12345;
      setRenderStartTime(testTime);
      expect(renderStartTime).toBe(testTime);
    });

    it("should merge trace options", () => {
      const newOptions = {
        enabled: false,
        internalLogLevel: "trace" as const
      };

      setTracerOptions(newOptions);

      expect(getTraceOptions().enabled).toBe(false);
      expect(getTraceOptions().internalLogLevel).toBe("trace");
    });

    it("should not log when internalLogLevel is error (default)", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const newOptions = {
        enabled: true,
        internalLogLevel: "error" as const
      };

      setTracerOptions(newOptions);

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
