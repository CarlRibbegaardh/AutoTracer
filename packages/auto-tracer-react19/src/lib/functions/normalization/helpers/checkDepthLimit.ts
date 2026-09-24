/**
 * @file Depth Limit Check
 *
 * Checks if recursion depth exceeds maximum allowed depth to prevent stack overflow.
 */

/**
 * Maximum recursion depth allowed.
 *
 * Prevents stack overflow from extremely deep object nesting.
 */
export const MAX_DEPTH = 10;

/**
 * Checks if depth limit has been exceeded.
 *
 * @param depth - Current recursion depth (0-indexed)
 * @returns "[MaxDepth]" if limit exceeded, null otherwise
 *
 * @example
 * ```typescript
 * checkDepthLimit(5);  // → null (OK)
 * checkDepthLimit(10); // → null (OK, at limit)
 * checkDepthLimit(11); // → "[MaxDepth]" (exceeded)
 * ```
 */
export function checkDepthLimit(depth: number): string | null {
  if (depth > MAX_DEPTH) {
    return "[MaxDepth]";
  }
  return null;
}
