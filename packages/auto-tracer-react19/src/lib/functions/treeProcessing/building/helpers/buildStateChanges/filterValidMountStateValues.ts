import { isReactInternal } from "../../../../isReactInternal.js";
import { REACTTRACER_STATE_MARKER } from "../../../../../types/marker.js";
import type { UseStateValueEntry } from "../buildStateChanges.js";

/**
 * Filters useState values that are valid for mount rendering.
 * Excludes React internal state and marker values.
 *
 * Pure function - no side effects, deterministic output.
 *
 * @param useStateValues - Array of useState entries from fiber
 * @returns Filtered array of valid state values for mount
 */
export function filterValidMountStateValues(
  useStateValues: UseStateValueEntry[]
): UseStateValueEntry[] {
  return useStateValues.filter(({ name, value }) => {
    return !isReactInternal(name) && value !== REACTTRACER_STATE_MARKER;
  });
}
