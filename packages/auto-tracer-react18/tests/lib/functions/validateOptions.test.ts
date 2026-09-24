import { describe, expect, it, vi } from "vitest";
import {
  validateMaxFiberDepth,
  validateReactTracerOptions,
} from "@src/lib/functions/validateOptions";

// Mock log functions
vi.mock("@src/lib/functions/log.js", () => {
  return {
    logWarn: vi.fn(),
  };
});

describe("validateOptions", () => {
  describe("validateMaxFiberDepth", () => {
    it("should return default value (500) when depth is undefined", () => {
      expect(validateMaxFiberDepth(undefined)).toBe(500);
    });

    it("should return default value (500) when depth is null", () => {
      expect(validateMaxFiberDepth(null as unknown as number)).toBe(500);
    });

    it("should return default value (500) and warn when depth is not a number", async () => {
      const { logWarn } = vi.mocked(await import("@src/lib/functions/log.js"));

      expect(validateMaxFiberDepth("invalid" as unknown as number)).toBe(500);
      expect(logWarn).toHaveBeenCalledWith(
        "ReactTracer: Invalid maxFiberDepth, using default (500)",
      );
    });

    it("should return default value (500) and warn when depth is NaN", async () => {
      const { logWarn } = vi.mocked(await import("@src/lib/functions/log.js"));

      expect(validateMaxFiberDepth(NaN)).toBe(500);
      expect(logWarn).toHaveBeenCalledWith(
        "ReactTracer: Invalid maxFiberDepth, using default (500)",
      );
    });

    it("should return minimum value (20) and warn when depth is too low", async () => {
      const { logWarn } = vi.mocked(await import("@src/lib/functions/log.js"));

      expect(validateMaxFiberDepth(10)).toBe(20);
      expect(logWarn).toHaveBeenCalledWith(
        "ReactTracer: maxFiberDepth too low, using minimum (20)",
      );
    });

    it("should return minimum value (20) and warn when depth is negative", async () => {
      const { logWarn } = vi.mocked(await import("@src/lib/functions/log.js"));

      expect(validateMaxFiberDepth(-5)).toBe(20);
      expect(logWarn).toHaveBeenCalledWith(
        "ReactTracer: maxFiberDepth too low, using minimum (20)",
      );
    });

    it("should return minimum value (20) and warn when depth is zero", async () => {
      const { logWarn } = vi.mocked(await import("@src/lib/functions/log.js"));

      expect(validateMaxFiberDepth(0)).toBe(20);
      expect(logWarn).toHaveBeenCalledWith(
        "ReactTracer: maxFiberDepth too low, using minimum (20)",
      );
    });

    it("should return exactly 20 when depth is 20 (minimum boundary)", () => {
      expect(validateMaxFiberDepth(20)).toBe(20);
    });

    it("should return the value when depth is valid (between 20 and 1000)", () => {
      expect(validateMaxFiberDepth(50)).toBe(50);
      expect(validateMaxFiberDepth(100)).toBe(100);
      expect(validateMaxFiberDepth(500)).toBe(500);
      expect(validateMaxFiberDepth(1000)).toBe(1000);
    });

    it("should return exactly 1000 when depth is 1000 (maximum boundary)", () => {
      expect(validateMaxFiberDepth(1000)).toBe(1000);
    });

    it("should return maximum value (1000) and warn when depth is too high", async () => {
      const { logWarn } = vi.mocked(await import("@src/lib/functions/log.js"));

      expect(validateMaxFiberDepth(15000)).toBe(1000);
      expect(logWarn).toHaveBeenCalledWith(
        "ReactTracer: maxFiberDepth too high, using maximum (1000)",
      );
    });

    it("should return floored integer when depth is a float", () => {
      expect(validateMaxFiberDepth(50.7)).toBe(50);
      expect(validateMaxFiberDepth(100.1)).toBe(100);
      expect(validateMaxFiberDepth(99.9)).toBe(99);
    });

    it("should handle floating point edge cases", () => {
      expect(validateMaxFiberDepth(19.9)).toBe(20); // Should clamp to minimum
      expect(validateMaxFiberDepth(20.1)).toBe(20); // Should floor to 20
      expect(validateMaxFiberDepth(1000.9)).toBe(1000); // Should floor to 1000
    });

    it("should handle Infinity", async () => {
      const { logWarn } = vi.mocked(await import("@src/lib/functions/log.js"));

      expect(validateMaxFiberDepth(Infinity)).toBe(1000);
      expect(logWarn).toHaveBeenCalledWith(
        "ReactTracer: maxFiberDepth too high, using maximum (1000)",
      );
    });

    it("should handle negative Infinity", async () => {
      const { logWarn } = vi.mocked(await import("@src/lib/functions/log.js"));

      expect(validateMaxFiberDepth(-Infinity)).toBe(20);
      expect(logWarn).toHaveBeenCalledWith(
        "ReactTracer: maxFiberDepth too low, using minimum (20)",
      );
    });
  });

  describe("validateReactTracerOptions", () => {
    it("should validate maxFiberDepth and return updated options", () => {
      const options = {
        enabled: true,
        maxFiberDepth: 50,
        includeReconciled: "always" as const,
      };

      const result = validateReactTracerOptions(options);

      expect(result).toEqual({
        enabled: true,
        maxFiberDepth: 50,
        includeReconciled: "always",
      });
    });

    it("should preserve all other options while validating maxFiberDepth", () => {
      const options = {
        enabled: false,
        internalLogLevel: "debug" as const,
        includeReconciled: "always" as const,
        includeSkipped: "never" as const,
        showFlags: true,
        maxFiberDepth: 200,
        includeNonTrackedBranches: true,
        skippedObjectProps: [{ objectName: "Component", propNames: ["prop1"] }],
        colors: {
          definitiveRender: {
            icon: "⚡",
            lightMode: { text: "blue" },
            darkMode: { text: "cyan" },
          },
        },
      };

      const result = validateReactTracerOptions(options);

      expect(result).toEqual({
        enabled: false,
        internalLogLevel: "debug",
        includeReconciled: "always",
        includeSkipped: "never",
        showFlags: true,
        maxFiberDepth: 200,
        includeNonTrackedBranches: true,
        skippedObjectProps: [{ objectName: "Component", propNames: ["prop1"] }],
        colors: {
          definitiveRender: {
            icon: "⚡",
            lightMode: { text: "blue" },
            darkMode: { text: "cyan" },
          },
        },
      });
    });

    it("should fix invalid maxFiberDepth while preserving other options", () => {
      const options = {
        enabled: true,
        maxFiberDepth: -10, // Invalid, should be clamped to 20
        includeReconciled: "never" as const,
      };

      const result = validateReactTracerOptions(options);

      expect(result).toEqual({
        enabled: true,
        maxFiberDepth: 20, // Should be clamped
        includeReconciled: "never",
      });
    });

    it("should handle options with undefined maxFiberDepth", () => {
      const options = {
        enabled: true,
        includeReconciled: "always" as const,
        // maxFiberDepth is undefined
      };

      const result = validateReactTracerOptions(options);

      expect(result).toEqual({
        enabled: true,
        maxFiberDepth: 500, // Should default to 500
        includeReconciled: "always",
      });
    });

    it("should handle empty options object", () => {
      const options = {};

      const result = validateReactTracerOptions(options);

      expect(result).toEqual({
        maxFiberDepth: 500, // Should default to 500
      });
    });

    it("should handle options with all kinds of invalid maxFiberDepth values", () => {
      const testCases = [
        { input: { maxFiberDepth: null }, expected: 500 },
        { input: { maxFiberDepth: "string" }, expected: 500 },
        { input: { maxFiberDepth: NaN }, expected: 500 },
        { input: { maxFiberDepth: 5 }, expected: 20 },
        { input: { maxFiberDepth: 15000 }, expected: 1000 },
        { input: { maxFiberDepth: 50.7 }, expected: 50 },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = validateReactTracerOptions(
          input as Parameters<typeof validateReactTracerOptions>[0],
        );
        expect(result.maxFiberDepth).toBe(expected);
      });
    });

    it("should not modify the input options object", () => {
      const originalOptions = {
        enabled: true,
        maxFiberDepth: -10,
        includeReconciled: "always" as const,
      };

      const optionsCopy = { ...originalOptions };
      validateReactTracerOptions(originalOptions);

      // Original should be unchanged
      expect(originalOptions).toEqual(optionsCopy);
    });
  });
});
