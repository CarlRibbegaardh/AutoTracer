/**
 * Loads and merges flow theme files from a directory following the 3-step hierarchy.
 *
 * **Important:** This function only works in Node.js environments. It will return an empty
 * object when called in browser environments where `fs` and `path` are not available.
 *
 * Searches for theme files matching patterns:
 * - Step 1: `*flow-theme.json` (base theme, applies to both light and dark modes)
 * - Step 2: `*flow-theme-light.json` (light mode override)
 * - Step 3: `*flow-theme-dark.json` (dark mode override)
 *
 * Supports named themes (e.g., `colorblind-flow-theme.json`) without requiring renaming.
 * If multiple files match a pattern, the first alphabetically sorted match wins.
 *
 * Each step merges deeply with previous steps, with later steps taking precedence.
 *
 * @param searchDir - Directory path to search for theme files
 * @returns Merged FlowThemeConfig from all found theme files, or empty object if none found
 *
 * @example
 * ```typescript
 * // Load theme files from project root (only works in Node.js)
 * const themeFromFiles = loadThemeFiles(process.cwd());
 *
 * // Merge with programmatic config
 * const finalTheme = mergeThemes({
 *   ...themeFromFiles,
 *   ...programmaticConfig?.theme
 * });
 * ```
 *
 * @remarks
 * - Returns empty object in browser environments (no fs module available)
 * - Invalid JSON files are silently ignored (returns empty object)
 * - Non-existent directories are handled gracefully (returns empty object)
 * - Only `.json` files are considered (`.txt`, `.md`, etc. are ignored)
 * - Deep merges preserve sibling properties across all hierarchy levels
 */

import merge from "deepmerge";
import type { FlowThemeConfig } from "../../types/FlowThemeConfig.js";
import { validateTheme } from "./validateTheme.js";

export async function loadThemeFiles(
  searchDir: string
): Promise<Partial<FlowThemeConfig>> {
  // Conditional access to Node.js-only modules
  // Using dynamic import for ESM compatibility
  let fs: typeof import("fs");
  let path: typeof import("path");

  try {
    // Dynamic import for Node.js built-in modules
    fs = await import("node:fs");
    path = await import("node:path");
  } catch (_error) {
    // Browser environment - fs/path not available
    return {};
  }

  // Handle non-existent directory gracefully
  if (!fs.existsSync(searchDir)) {
    return {};
  }

  let files: string[];
  try {
    files = fs.readdirSync(searchDir);
  } catch (_error) {
    return {};
  }

  // Helper: Find first file matching pattern (alphabetically sorted)
  const findFirstMatch = (pattern: RegExp): string | undefined => {
    const matches = files
      .filter((file) => {
        const isMatch = pattern.test(file) && file.endsWith(".json");
        return isMatch;
      })
      .sort();
    return matches[0];
  };

  // Helper: Load and parse JSON file safely
  const loadJsonFile = (filename: string): Partial<FlowThemeConfig> => {
    try {
      const filePath = path.join(searchDir, filename);
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);

      // Validate theme structure and report errors
      const errors = validateTheme(parsed, filename);
      if (errors.length > 0) {
        console.warn(`[FlowTracer] Theme validation errors in "${filename}":`);
        errors.forEach((themeError) => {
          console.warn(`  - ${themeError}`);
        });
      }

      return parsed;
    } catch (error) {
      // Log warning for invalid JSON to help developers debug
      console.warn(
        `[FlowTracer] Warning: Failed to parse theme file "${filename}". Using defaults.`,
        error instanceof Error ? error.message : error
      );
      return {};
    }
  };

  // Step 1: Load base theme (*flow-theme.json)
  const baseFile = findFirstMatch(/^[^.]*flow-theme\.json$/);
  let result: Partial<FlowThemeConfig> = baseFile ? loadJsonFile(baseFile) : {};

  // Step 2: Merge light mode override (*flow-theme-light.json)
  const lightFile = findFirstMatch(/^[^.]*flow-theme-light\.json$/);
  if (lightFile) {
    const lightOverride = loadJsonFile(lightFile);
    result = merge(result, lightOverride, {
      arrayMerge: (_target, source) => {
        return source;
      },
    });
  }

  // Step 3: Merge dark mode override (*flow-theme-dark.json)
  const darkFile = findFirstMatch(/^[^.]*flow-theme-dark\.json$/);
  if (darkFile) {
    const darkOverride = loadJsonFile(darkFile);
    result = merge(result, darkOverride, {
      arrayMerge: (_target, source) => {
        return source;
      },
    });
  }

  return result;
}
