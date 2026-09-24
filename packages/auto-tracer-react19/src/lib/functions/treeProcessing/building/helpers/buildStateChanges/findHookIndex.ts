import type { Hook } from "../../../../hookMapping/types.js";

/**
 * Find the index of a hook object in the anchors array by reference equality.
 * Uses reference comparison to match hook objects.
 *
 * Pure function - no side effects, deterministic output.
 *
 * @param hook - The hook object from UseStateValueEntry (or null)
 * @param anchors - Array of Hook objects from fiber memoizedState chain
 * @returns Index in anchors array, or -1 if not found or hook is null
 */
export function findHookIndex(
  hook: { memoizedState: unknown; queue: unknown; next: unknown } | null,
  anchors: readonly Hook[]
): number {
  if (!hook) return -1;
  for (let i = 0; i < anchors.length; i++) {
    // Reference equality works because both types share the same structure
    // and point to the same object instances
    if (Object.is(anchors[i], hook)) {
      return i;
    }
  }
  return -1;
}
