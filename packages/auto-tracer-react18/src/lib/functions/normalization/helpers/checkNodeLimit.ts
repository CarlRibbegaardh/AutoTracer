/**
 * @file Node Count Limit Check
 *
 * Checks if node count exceeds maximum allowed to prevent hanging on huge object graphs.
 */

/**
 * Maximum number of nodes to process.
 *
 * Prevents hanging on extremely large object graphs (e.g., massive arrays, deep nesting).
 */
export const MAX_NODES = 1000;

/**
 * Node counter object for tracking processed nodes.
 */
export interface NodeCount {
  count: number;
}

/**
 * Checks if node count limit has been exceeded.
 *
 * @param nodeCount - Node counter object
 * @returns "[MaxNodes]" if limit exceeded, null otherwise
 *
 * @example
 * ```typescript
 * const counter = { count: 500 };
 * checkNodeLimit(counter); // → null (OK)
 *
 * counter.count = 1001;
 * checkNodeLimit(counter); // → "[MaxNodes]" (exceeded)
 * ```
 */
export function checkNodeLimit(nodeCount: NodeCount): string | null {
  if (nodeCount.count > MAX_NODES) {
    return "[MaxNodes]";
  }
  return null;
}
