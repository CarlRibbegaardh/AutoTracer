import { componentLogRegistry } from "../componentLogRegistry.js";
import { clearAllHookLabels } from "../hookLabels.js";
import { getTrackedGUIDsSet } from "./getTrackedGUIDsSet.js";
import { getTrackedNamesMap } from "./getTrackedNamesMap.js";

/**
 * Clear the registry for the next render cycle
 */
export function clearRenderRegistry(): void {
  getTrackedGUIDsSet().clear();
  getTrackedNamesMap().clear();
  componentLogRegistry.clear();
  clearAllHookLabels(); // Clear labels to prevent accumulation across render cycles
}
