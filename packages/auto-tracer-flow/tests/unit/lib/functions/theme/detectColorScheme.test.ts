import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { detectColorScheme } from "../../../../../src/lib/functions/theme/detectColorScheme";

describe("detectColorScheme", () => {
  let originalMatchMedia: typeof window.matchMedia | undefined;

  beforeEach(() => {
    // Save original matchMedia if it exists
    if (typeof window !== "undefined") {
      originalMatchMedia = window.matchMedia;
    }
  });

  afterEach(() => {
    // Restore original matchMedia
    if (typeof window !== "undefined" && originalMatchMedia) {
      window.matchMedia = originalMatchMedia;
    }
  });

  describe("browser environment", () => {
    it("should return 'dark' when prefers-color-scheme is dark", () => {
      // Mock matchMedia to return dark mode
      global.window = {
        matchMedia: vi.fn().mockImplementation((query: string) => ({
          matches: query === "(prefers-color-scheme: dark)",
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      } as unknown as Window & typeof globalThis;

      const result = detectColorScheme();
      expect(result).toBe("dark");
    });

    it("should return 'light' when prefers-color-scheme is light", () => {
      // Mock matchMedia to return light mode
      global.window = {
        matchMedia: vi.fn().mockImplementation((query: string) => ({
          matches: query === "(prefers-color-scheme: light)",
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      } as unknown as Window & typeof globalThis;

      const result = detectColorScheme();
      expect(result).toBe("light");
    });

    it("should return 'light' when matchMedia doesn't match dark", () => {
      // Mock matchMedia to return no match for dark mode
      global.window = {
        matchMedia: vi.fn().mockImplementation(() => ({
          matches: false,
          media: "(prefers-color-scheme: dark)",
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      } as unknown as Window & typeof globalThis;

      const result = detectColorScheme();
      expect(result).toBe("light");
    });
  });

  describe("non-browser environment (Node.js)", () => {
    it("should return 'light' when window is undefined", () => {
      // Temporarily remove window
      const originalWindow = global.window;
      // @ts-expect-error - Intentionally setting to undefined for test
      delete global.window;

      const result = detectColorScheme();
      expect(result).toBe("light");

      // Restore window
      global.window = originalWindow;
    });

    it("should return 'light' when matchMedia is undefined", () => {
      // Mock window without matchMedia
      global.window = {} as Window & typeof globalThis;

      const result = detectColorScheme();
      expect(result).toBe("light");
    });
  });

  describe("pure function behavior", () => {
    it("should be consistent - same environment returns same result", () => {
      global.window = {
        matchMedia: vi.fn().mockImplementation(() => ({
          matches: true,
          media: "(prefers-color-scheme: dark)",
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      } as unknown as Window & typeof globalThis;

      const result1 = detectColorScheme();
      const result2 = detectColorScheme();

      expect(result1).toBe(result2);
      expect(result1).toBe("dark");
    });
  });

  describe("return type", () => {
    it("should return exactly 'light' or 'dark'", () => {
      global.window = {
        matchMedia: vi.fn().mockImplementation(() => ({
          matches: false,
          media: "(prefers-color-scheme: dark)",
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      } as unknown as Window & typeof globalThis;

      const result = detectColorScheme();
      expect(result === "light" || result === "dark").toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle matchMedia throwing an error", () => {
      global.window = {
        matchMedia: vi.fn().mockImplementation(() => {
          throw new Error("matchMedia not supported");
        }),
      } as unknown as Window & typeof globalThis;

      const result = detectColorScheme();
      expect(result).toBe("light"); // Default to light on error
    });

    it("should handle null matchMedia return", () => {
      global.window = {
        matchMedia: vi.fn().mockReturnValue(null),
      } as unknown as Window & typeof globalThis;

      const result = detectColorScheme();
      expect(result).toBe("light");
    });
  });
});
