import { getTrackedGUIDsSet } from "./getTrackedGUIDsSet.js";

/**
 * Get all tracked GUIDs (for debugging)
 */
export function getTrackedGUIDs(): Set<string> {
  return new Set(getTrackedGUIDsSet());
}
