import { getOrCreateSharedRegistry } from "./getOrCreateSharedRegistry.js";

/**
 * Gets the shared tracked names Map.
 *
 * Side effects: may create the shared registry on globalThis.
 *
 * @returns Shared trackedNames Map mapping GUIDs to component names
 */
export function getTrackedNamesMap(): Map<string, string> {
  return getOrCreateSharedRegistry().trackedNames;
}
