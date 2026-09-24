/**
 * @file Circular Reference Check
 *
 * Checks if a value has already been visited to detect circular references.
 */

/**
 * Checks if a value has already been visited (circular reference detection).
 *
 * @param value - Value to check
 * @param visited - WeakSet tracking visited objects
 * @returns "[Circular]" if value was already visited, null otherwise
 *
 * @example
 * ```typescript
 * const visited = new WeakSet();
 * const obj = { a: 1 };
 *
 * checkCircularReference(obj, visited); // → null (first visit)
 * visited.add(obj);
 * checkCircularReference(obj, visited); // → "[Circular]" (revisit)
 * ```
 */
export function checkCircularReference(
  value: unknown,
  visited: WeakSet<object>
): string | null {
  // Not an object - can't be circular
  if (typeof value !== "object" || value === null) {
    return null;
  }

  if (visited.has(value)) {
    return "[Circular]";
  }

  return null;
}
