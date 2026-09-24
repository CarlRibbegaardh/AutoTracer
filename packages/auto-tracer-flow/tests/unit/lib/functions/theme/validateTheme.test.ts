import { describe, it, expect } from "vitest";
import { validateTheme } from "../../../../../dist/lib/functions/theme/validateTheme";

describe("validateTheme", () => {
  describe("Valid themes", () => {
    it("should accept valid theme with darkMode", () => {
      const theme = {
        functionEnter: {
          darkMode: {
            text: "#61afef",
            bold: true,
          },
        },
      };

      const errors = validateTheme(theme, "test-theme.json");
      expect(errors).toEqual([]);
    });

    it("should accept valid theme with both darkMode and lightMode", () => {
      const theme = {
        asyncStart: {
          darkMode: {
            text: "#c678dd",
            background: "#2c2c2c",
            bold: true,
          },
          lightMode: {
            text: "#a626a4",
            background: "#f0f0f0",
          },
          icon: "🚀",
        },
      };

      const errors = validateTheme(theme, "test-theme.json");
      expect(errors).toEqual([]);
    });

    it("should accept theme with icon only", () => {
      const theme = {
        exception: {
          icon: "💥",
        },
      };

      const errors = validateTheme(theme, "test-theme.json");
      expect(errors).toEqual([]);
    });

    it("should accept all valid categories", () => {
      const theme = {
        asyncStart: { darkMode: { text: "#fff" } },
        asyncComplete: { darkMode: { text: "#fff" } },
        functionEnter: { darkMode: { text: "#fff" } },
        functionExit: { darkMode: { text: "#fff" } },
        parameter: { darkMode: { text: "#fff" } },
        returnValue: { darkMode: { text: "#fff" } },
        exception: { darkMode: { text: "#fff" } },
        runtimeControl: { darkMode: { text: "#fff" } },
      };

      const errors = validateTheme(theme, "test-theme.json");
      expect(errors).toEqual([]);
    });

    it("should accept various CSS color formats", () => {
      const theme = {
        functionEnter: {
          darkMode: {
            text: "#61afef", // hex
            background: "rgb(97, 175, 239)", // rgb
          },
        },
        functionExit: {
          darkMode: {
            text: "rgba(152, 195, 121, 0.9)", // rgba
          },
        },
        asyncStart: {
          darkMode: {
            text: "hsl(220, 100%, 50%)", // hsl
          },
        },
        asyncComplete: {
          darkMode: {
            text: "red", // named color
          },
        },
      };

      const errors = validateTheme(theme, "test-theme.json");
      expect(errors).toEqual([]);
    });
  });

  describe("Common mistakes", () => {
    it("should detect 'dark' instead of 'darkMode'", () => {
      const theme = {
        functionEnter: {
          dark: {
            text: "#61afef",
          },
        },
      };

      const errors = validateTheme(theme, "flow-theme-dark.json");
      expect(errors).toHaveLength(2); // Common mistake + invalid key error
      expect(errors.some((e: string) => e.includes('uses "dark" but should use "darkMode"'))).toBe(true);
    });

    it("should detect 'light' instead of 'lightMode'", () => {
      const theme = {
        asyncStart: {
          light: {
            text: "#a626a4",
          },
        },
      };

      const errors = validateTheme(theme, "flow-theme-light.json");
      expect(errors).toHaveLength(2); // Common mistake + invalid key error
      expect(errors.some((e: string) => e.includes('uses "light" but should use "lightMode"'))).toBe(true);
    });

    it("should detect both dark and light mistakes", () => {
      const theme = {
        functionEnter: {
          dark: { text: "#000" },
          light: { text: "#fff" },
        },
      };

      const errors = validateTheme(theme, "test-theme.json");
      expect(errors).toHaveLength(4); // 2 common mistake warnings + 2 invalid key errors
      expect(errors.some((e: string) => e.includes('"dark"'))).toBe(true);
      expect(errors.some((e: string) => e.includes('"light"'))).toBe(true);
    });
  });

  describe("Invalid structure", () => {
    it("should reject non-object theme", () => {
      const errors = validateTheme("not an object", "test-theme.json");
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain("must be a JSON object");
    });

    it("should reject null theme", () => {
      const errors = validateTheme(null, "test-theme.json");
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain("must be a JSON object");
    });

    it("should reject unknown category", () => {
      const theme = {
        invalidCategory: {
          darkMode: { text: "#fff" },
        },
      };

      const errors = validateTheme(theme, "test-theme.json");
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('Unknown theme category "invalidCategory"');
      expect(errors[0]).toContain("Valid categories:");
    });

    it("should reject non-object category value", () => {
      const theme = {
        functionEnter: "not an object",
      };

      const errors = validateTheme(theme, "test-theme.json");
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain(
        'Theme category "functionEnter" must be an object'
      );
    });

    it("should reject invalid mode key", () => {
      const theme = {
        functionEnter: {
          invalidMode: { text: "#fff" },
        },
      };

      const errors = validateTheme(theme, "test-theme.json");
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('has invalid key "invalidMode"');
      expect(errors[0]).toContain("Valid keys:");
    });

    it("should reject non-object mode value", () => {
      const theme = {
        functionEnter: {
          darkMode: "not an object",
        },
      };

      const errors = validateTheme(theme, "test-theme.json");
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain(
        '"functionEnter.darkMode" must be an object'
      );
    });
  });

  describe("Invalid theme options", () => {
    it("should reject non-string icon", () => {
      const theme = {
        functionEnter: {
          icon: 123,
        },
      };

      const errors = validateTheme(theme, "test-theme.json");
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('"functionEnter.icon" must be a string');
    });

    it("should reject invalid theme option key", () => {
      const theme = {
        functionEnter: {
          darkMode: {
            invalidOption: "value",
          },
        },
      };

      const errors = validateTheme(theme, "test-theme.json");
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('is not a valid theme option');
      // Note: "icon" is NOT listed because it belongs at category level, not inside darkMode/lightMode
      expect(errors[0]).toContain("Valid options: background, text, bold, italic");
    });

    it("should reject non-string text color", () => {
      const theme = {
        functionEnter: {
          darkMode: {
            text: 123,
          },
        },
      };

      const errors = validateTheme(theme, "test-theme.json");
      expect(errors).toHaveLength(1);
      expect(errors.some((e: string) => e.includes('must be a CSS color string'))).toBe(true);
    });

    it("should reject invalid CSS color", () => {
      const theme = {
        functionEnter: {
          darkMode: {
            text: "not-a-color",
          },
        },
      };

      const errors = validateTheme(theme, "test-theme.json");
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('invalid CSS color "not-a-color"');
    });

    it("should reject non-boolean bold", () => {
      const theme = {
        functionEnter: {
          darkMode: {
            bold: "true",
          },
        },
      };

      const errors = validateTheme(theme, "test-theme.json");
      expect(errors).toHaveLength(1);
      expect(errors.some((e: string) => e.includes('must be a boolean'))).toBe(true);
    });

    it("should reject non-boolean italic", () => {
      const theme = {
        functionEnter: {
          darkMode: {
            italic: 1,
          },
        },
      };

      const errors = validateTheme(theme, "test-theme.json");
      expect(errors).toHaveLength(1);
      expect(errors.some((e: string) => e.includes('must be a boolean'))).toBe(true);
    });
  });

  describe("Multiple errors", () => {
    it("should report all errors in a malformed theme", () => {
      const theme = {
        functionEnter: {
          dark: {
            // Should be darkMode - will report 2 errors but won't validate nested content
            text: "invalid-color",
            bold: "yes",
          },
          darkMode: {
            // Valid key - will validate nested content
            text: "invalid-color", // This will be reported
            bold: "yes", // This will be reported
          },
        },
        invalidCategory: {
          // Unknown category
          darkMode: { text: "#fff" },
        },
      };

      const errors = validateTheme(theme, "test-theme.json");
      expect(errors.length).toBeGreaterThan(4);
      expect(errors.some((e: string) => e.includes('"dark"'))).toBe(true);
      expect(errors.some((e: string) => e.includes("invalid-color"))).toBe(true);
      expect(errors.some((e: string) => e.includes("invalidCategory"))).toBe(true);
      expect(errors.some((e: string) => e.includes('must be a boolean'))).toBe(true);
    });
  });
});
