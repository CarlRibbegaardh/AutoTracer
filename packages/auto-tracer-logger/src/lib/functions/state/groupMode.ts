import type { GroupMode } from "../../types/GroupMode.js";

/**
 * Default grouping mode.
 */
const defaultGroupMode: GroupMode = "default";

/**
 * Current grouping mode state.
 *
 * Internal module state.
 */
let currentGroupMode: GroupMode = defaultGroupMode;

/**
 * Gets the current grouping mode.
 *
 * @internal
 */
export function getGroupModeInternal(): GroupMode {
  return currentGroupMode;
}

/**
 * Sets the current grouping mode.
 *
 * @param mode - New grouping mode
 * @internal
 */
export function setGroupModeInternal(mode: GroupMode): void {
  currentGroupMode = mode;
}
