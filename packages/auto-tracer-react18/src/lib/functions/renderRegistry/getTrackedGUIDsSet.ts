import { getOrCreateSharedRegistry } from "./getOrCreateSharedRegistry.js";

/**
 * Gets the shared tracked GUIDs Set.
 *
 * Side effects: may create the shared registry on globalThis.
 *
 * @returns Shared trackedGUIDs Set containing all registered component instance GUIDs
 */
export function getTrackedGUIDsSet(): Set<string> {
  return getOrCreateSharedRegistry().trackedGUIDs;
}
