import { getTrackedGUIDsSet } from "./getTrackedGUIDsSet.js";
import { getTrackedNamesMap } from "./getTrackedNamesMap.js";

/**
 * Register a GUID for testing purposes.
 * This allows tests to simulate tracked components without using the useReactTracer hook.
 * @internal
 */
export function registerTrackedGUID(guid: string, componentName?: string): void {
  getTrackedGUIDsSet().add(guid);
  if (componentName) {
    getTrackedNamesMap().set(guid, componentName);
  }
}
