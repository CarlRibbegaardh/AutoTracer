import { getTrackedNamesMap } from "./getTrackedNamesMap.js";

/**
 * Get the component name associated with a tracking GUID.
 * @param guid - The tracking GUID
 * @returns The component name if registered, undefined otherwise
 */
export function getTrackedName(guid: string): string | undefined {
  return getTrackedNamesMap().get(guid);
}
