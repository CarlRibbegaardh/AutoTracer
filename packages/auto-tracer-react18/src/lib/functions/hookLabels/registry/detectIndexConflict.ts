/**
 * @file Detects index conflicts for internal hook labeling.
 */

import type { LabelEntry } from "../LabelEntry.js";

/**
 * Detects if a hook index has a label assigned but the value didn't match.
 * This indicates the hook at this index is likely an internal hook from a custom hook.
 *
 * Example:
 * - useForm() internally calls useState at index 0
 * - Plugin labels index 0 as "form" (the API object)
 * - Internal hook value ≠ labeled value → conflict
 * - Return "form.internal" instead of "unknown"
 *
 * @param anchorIndex - The fiber hook index being resolved
 * @param labels - All stored labels for this component
 * @returns The label with ".internal" suffix if conflict detected, otherwise null
 */
export function detectIndexConflict(
  anchorIndex: number,
  labels: readonly LabelEntry[]
): string | null {
  // Find any label stored at this same index
  const labelAtSameIndex = labels.find((entry) => {
    return entry.index === anchorIndex;
  });

  // If a label exists at this index but we didn't match it,
  // this hook is likely internal to the custom hook
  if (labelAtSameIndex) {
    return `${labelAtSameIndex.label}.internal`;
  }

  return null;
}
