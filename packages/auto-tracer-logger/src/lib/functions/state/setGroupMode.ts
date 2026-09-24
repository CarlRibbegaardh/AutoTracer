import type { GroupMode } from "../../types/GroupMode.js";
import { setGroupModeInternal } from "./groupMode.js";

/**
 * Sets the current logger grouping mode.
 *
 * @param mode - The new grouping mode
 */
export function setGroupMode(mode: GroupMode): void {
  setGroupModeInternal(mode);
}
