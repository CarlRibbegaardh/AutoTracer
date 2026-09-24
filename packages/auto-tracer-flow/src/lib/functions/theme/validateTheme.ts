/**
 * Validates a theme configuration object against the FlowThemeConfig schema.
 * Reports detailed errors for common mistakes like using "dark"/"light" instead of "darkMode"/"lightMode".
 *
 * @param theme - Theme object loaded from JSON file
 * @param filename - Name of the file being validated (for error messages)
 * @returns Array of validation error messages, empty if valid
 *
 * @example
 * ```typescript
 * const theme = JSON.parse(fileContent);
 * const errors = validateTheme(theme, "flow-theme-dark.json");
 * if (errors.length > 0) {
 *   console.error("Theme validation errors:", errors);
 * }
 * ```
 */
import { isRecord } from "../../isRecord.js";

export function validateTheme(
  theme: unknown,
  filename: string
): string[] {
  const errors: string[] = [];

  if (!isRecord(theme)) {
    errors.push(`${filename}: Theme must be a JSON object`);
    return errors;
  }

  const themeObj = theme;
  const validCategories = [
    "asyncStart",
    "asyncComplete",
    "functionEnter",
    "functionExit",
    "parameter",
    "returnValue",
    "exception",
    "runtimeControl",
  ];

  // Check each top-level property
  for (const [category, value] of Object.entries(themeObj)) {
    if (!validCategories.includes(category)) {
      errors.push(
        `${filename}: Unknown theme category "${category}". Valid categories: ${validCategories.join(", ")}`
      );
      continue;
    }

    if (!isRecord(value)) {
      errors.push(
        `${filename}: Theme category "${category}" must be an object`
      );
      continue;
    }

    const categoryObj = value;

    // Check for common mistake: using "dark" instead of "darkMode"
    if ("dark" in categoryObj) {
      errors.push(
        `${filename}: Category "${category}" uses "dark" but should use "darkMode"`
      );
    }
    if ("light" in categoryObj) {
      errors.push(
        `${filename}: Category "${category}" uses "light" but should use "lightMode"`
      );
    }

    // Validate ColorOptions structure
    const validModeKeys = ["darkMode", "lightMode", "icon"];
    for (const [key, modeValue] of Object.entries(categoryObj)) {
      if (!validModeKeys.includes(key)) {
        errors.push(
          `${filename}: Category "${category}" has invalid key "${key}". Valid keys: ${validModeKeys.join(", ")}`
        );
        continue;
      }

      if (key === "icon") {
        if (typeof modeValue !== "string") {
          errors.push(
            `${filename}: Category "${category}.icon" must be a string`
          );
        }
        continue;
      }

      // Validate ThemeOptions (darkMode/lightMode)
      if (!isRecord(modeValue)) {
        errors.push(
          `${filename}: Category "${category}.${key}" must be an object`
        );
        continue;
      }

      const themeOptions = modeValue;
      const validThemeKeys = ["background", "text", "bold", "italic"];

      // Reject icon inside darkMode/lightMode - it belongs at category level only
      if ("icon" in themeOptions) {
        errors.push(
          `${filename}: Category "${category}.${key}" should not have "icon" property. Move "icon" to category level (peer to darkMode/lightMode)`
        );
      }

      for (const [optKey, optValue] of Object.entries(themeOptions)) {
        if (!validThemeKeys.includes(optKey)) {
          errors.push(
            `${filename}: Category "${category}.${key}.${optKey}" is not a valid theme option. Valid options: ${validThemeKeys.join(", ")}`
          );
          continue;
        }

        // Validate types
        if (optKey === "background" || optKey === "text") {
          if (typeof optValue !== "string") {
            errors.push(
              `${filename}: Category "${category}.${key}.${optKey}" must be a CSS color string`
            );
          } else if (!isValidCSSColor(optValue)) {
            errors.push(
              `${filename}: Category "${category}.${key}.${optKey}" has invalid CSS color "${optValue}"`
            );
          }
        } else if (optKey === "bold" || optKey === "italic") {
          if (typeof optValue !== "boolean") {
            errors.push(
              `${filename}: Category "${category}.${key}.${optKey}" must be a boolean`
            );
          }
        }
      }
    }
  }

  return errors;
}

/**
 * Validates if a string is a valid CSS color.
 * Supports hex colors, rgb/rgba, hsl/hsla, and named colors.
 *
 * @param color - Color string to validate
 * @returns True if valid CSS color
 */
function isValidCSSColor(color: string): boolean {
  // Hex colors: #rgb, #rrggbb, #rrggbbaa
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(color)) {
    return true;
  }

  // rgb/rgba
  if (/^rgba?\([^)]+\)$/i.test(color)) {
    return true;
  }

  // hsl/hsla
  if (/^hsla?\([^)]+\)$/i.test(color)) {
    return true;
  }

  // Named colors (basic set)
  const namedColors = [
    "transparent",
    "black",
    "white",
    "red",
    "green",
    "blue",
    "yellow",
    "orange",
    "purple",
    "pink",
    "gray",
    "grey",
    "brown",
    "cyan",
    "magenta",
  ];

  return namedColors.includes(color.toLowerCase());
}
