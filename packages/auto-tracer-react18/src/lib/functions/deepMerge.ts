import merge from "deepmerge";
import type { ReactTracerOptions } from "../interfaces/ReactTracerOptions.js";

/**
 * Deep merge utility for ReactTracerOptions.
 * Recursively merges nested color configurations and all other properties.
 * Uses the battle-tested `deepmerge` library for immutable, predictable merging.
 *
 * Configuration:
 * - Arrays are replaced (not concatenated) to preserve reference identity
 * - Undefined source values are filtered out before merging (target values are preserved)
 */
export function deepMergeOptions(
  target: ReactTracerOptions,
  source: Partial<ReactTracerOptions>
): ReactTracerOptions {
  /**
   * Removes keys with `undefined` values from a shallow copy.
   *
   * Side effects: mutates only the provided local object.
   *
   * @param options - Options to sanitize
   */
  function removeUndefinedKeys(options: Partial<ReactTracerOptions>): void {
    const record: Record<string, unknown> = options;

    Object.entries(record).forEach((entry) => {
      const [key, value] = entry;
      if (value !== undefined) {
        return;
      }

      delete record[key];
    });
  }

  // Filter out undefined values from source before merging
  const filteredSource: Partial<ReactTracerOptions> = { ...source };
  removeUndefinedKeys(filteredSource);

  return merge<ReactTracerOptions>(target, filteredSource, {
    // Replace arrays instead of concatenating (preserves array reference)
    arrayMerge: (_target, source) => {
      return source;
    },
  });
}
