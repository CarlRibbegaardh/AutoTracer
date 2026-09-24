import { isReactInternal } from "../../../../isReactInternal.js";
import { REACTTRACER_STATE_MARKER } from "../../../../../types/marker.js";
import type { UseStateValueEntry } from "../buildStateChanges.js";

/**
 * Filters useState values that represent actual changes during updates.
 * Excludes values without prevValue, unchanged values, React internals, and markers.
 *
 * Pure function - no side effects, deterministic output.
 *
 * @param useStateValues - Array of useState entries with previous values
 * @returns Filtered array of changed state values for update
 */
export function filterChangedUpdateStateValues(
  useStateValues: UseStateValueEntry[]
): UseStateValueEntry[] {
  return useStateValues.filter(({ name, value, prevValue }) => {
    return (
      prevValue !== undefined &&
      prevValue !== value &&
      !isReactInternal(name) &&
      value !== REACTTRACER_STATE_MARKER &&
      prevValue !== REACTTRACER_STATE_MARKER
    );
  });
}
