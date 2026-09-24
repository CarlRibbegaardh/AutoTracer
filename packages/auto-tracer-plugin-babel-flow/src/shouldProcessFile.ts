import { shouldProcessFile as shouldProcessFileBase } from "@autotracer/filter-utils";

/**
 * Checks if a file path should be processed based on include/exclude patterns.
 * Delegates to shared filter-utils implementation.
 * Pure function with no side effects.
 *
 * @param filename - File path to check
 * @param include - Include patterns (glob)
 * @param exclude - Exclude patterns (glob)
 * @returns True if file should be processed
 */
export function shouldProcessFile(
  filename: string,
  include?: { paths?: string[] },
  exclude?: { paths?: string[] }
): boolean {
  return shouldProcessFileBase(filename, include, exclude);
}
