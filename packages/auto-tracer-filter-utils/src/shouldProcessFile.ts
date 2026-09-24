import { minimatch } from "minimatch";

/**
 * Checks whether a normalized file path matches a glob pattern.
 *
 * This helper supports both absolute filenames (as produced by Vite/Babel) and
 * project-relative globs (as typically authored in config).
 *
 * If the pattern is not absolute/rooted and does not already start with a
 * globstar prefix (`**` + `/`), it is also tested with a leading globstar so
 * patterns that target TSX files under a `src` folder can match absolute
 * filenames containing `/src/`.
 *
 * @param normalizedPath - File path with forward slashes
 * @param rawPattern - Glob pattern from config
 * @returns True when the path matches the glob
 */
function matchesFilePathGlob(
  normalizedPath: string,
  rawPattern: string
): boolean {
  const pattern = rawPattern.replace(/\\/g, "/");

  if (minimatch(normalizedPath, pattern)) {
    return true;
  }

  const isAbsolutePattern =
    pattern.startsWith("/") || /^[A-Za-z]:\//.test(pattern);
  const isAlreadyRecursive = pattern.startsWith("**/");

  if (isAbsolutePattern || isAlreadyRecursive) {
    return false;
  }

  return minimatch(normalizedPath, `**/${pattern}`);
}

/**
 * Checks if a file path should be processed based on include/exclude patterns.
 * Pure function with no side effects.
 *
 * @param filename - File path to check
 * @param include - Include patterns (glob)
 * @param exclude - Exclude patterns (glob)
 * @returns True if file should be processed
 *
 * @example
 * shouldProcessFile("src/App.tsx", { paths: ["src/**"] }, { paths: ["**\/*.test.*"] })
 * // Returns: true (matches include, doesn't match exclude)
 */
export function shouldProcessFile(
  filename: string,
  include?: { paths?: string[] },
  exclude?: { paths?: string[] }
): boolean {
  // Normalize path separators for cross-platform matching
  const normalizedPath = filename.replace(/\\/g, "/");

  // Check exclude patterns first (they take precedence)
  if (exclude?.paths && exclude.paths.length > 0) {
    for (const pattern of exclude.paths) {
      if (matchesFilePathGlob(normalizedPath, pattern)) {
        return false; // Excluded
      }
    }
  }

  // If include patterns specified, file must match at least one
  if (include?.paths && include.paths.length > 0) {
    for (const pattern of include.paths) {
      if (matchesFilePathGlob(normalizedPath, pattern)) {
        return true; // Included
      }
    }
    return false; // Didn't match any include pattern
  }

  // No include patterns specified, process by default (unless excluded above)
  return true;
}
