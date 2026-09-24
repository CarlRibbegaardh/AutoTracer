import type { StateChangeEntry } from "../../../buildStateChanges.js";
import { detectIdenticalValueChange } from "../../detectIdenticalValueChange.js";

/**
 * Creates a state change entry if the labeled value has actually changed.
 * Pure function - no side effects.
 *
 * Returns null if:
 * - No previous value exists (label not in map)
 * - Value is unchanged (same reference)
 *
 * Note: Distinguishes between "key doesn't exist" and "key exists with undefined value"
 * by using Map.has() instead of checking if get() returns undefined.
 *
 * @param label - The label name for this state
 * @param value - The current value
 * @param prevValueMap - Map of previous label values for lookup
 * @returns StateChangeEntry if changed, null otherwise
 */
export function createLabelChangeEntry(
  label: string,
  value: unknown,
  prevValueMap: ReadonlyMap<string, unknown>
): StateChangeEntry | null {
  // Skip if no previous value (new label - key doesn't exist)
  if (!prevValueMap.has(label)) {
    return null;
  }

  const prevValue = prevValueMap.get(label);

  // Skip if value unchanged
  if (prevValue === value) {
    return null;
  }

  const isIdenticalValueChange = detectIdenticalValueChange(prevValue, value);

  return {
    name: label,
    value,
    prevValue,
    hook: null, // Labels-only doesn't reference fiber hooks
    isIdenticalValueChange,
  };
}
