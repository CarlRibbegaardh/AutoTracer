import { getGroupModeInternal } from "./groupMode.js";

/**
 * Gets the current logger grouping mode.
 *
 * @returns The current grouping mode
 */
export function getGroupMode() {
  return getGroupModeInternal();
}
