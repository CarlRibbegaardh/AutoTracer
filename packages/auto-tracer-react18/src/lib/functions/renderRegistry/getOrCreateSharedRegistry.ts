/**
 * Gets or creates the shared component registry on globalThis.
 *
 * Side effects: may create `globalThis.__autoTracerInternal.sharedComponentRegistry`.
 *
 * @returns Shared component registry containing trackedGUIDs Set and trackedNames Map
 */
export function getOrCreateSharedRegistry(): {
  trackedGUIDs: Set<string>;
  trackedNames: Map<string, string>;
} {
  if (!globalThis.__autoTracerInternal) {
    globalThis.__autoTracerInternal = {
      outputMode: "devtools",
      subscribers: [],
    };
  }

  if (!globalThis.__autoTracerInternal.sharedComponentRegistry) {
    globalThis.__autoTracerInternal.sharedComponentRegistry = {
      trackedGUIDs: new Set<string>(),
      trackedNames: new Map<string, string>(),
    };
  }

  return globalThis.__autoTracerInternal.sharedComponentRegistry;
}
