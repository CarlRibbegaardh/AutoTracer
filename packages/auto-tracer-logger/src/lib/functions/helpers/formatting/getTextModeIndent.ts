import { getDepth } from "../../state/groupDepth.js";
import { getGroupModeInternal } from "../../state/groupMode.js";
import { calculateGroupIndent } from "./calculateGroupIndent.js";

/**
 * Gets the indentation prefix for the current group depth when using text group mode.
 *
 * Side effects:
 * - Reads internal logger state via `getGroupModeInternal()` and `getDepth()`.
 *
 * @returns The indentation prefix for the current depth in text mode, or an empty string.
 */
export function getTextModeIndent(): string {
  const groupMode = getGroupModeInternal();
  if (groupMode !== "text") {
    return "";
  }

  const depth = getDepth();
  return calculateGroupIndent(depth);
}
