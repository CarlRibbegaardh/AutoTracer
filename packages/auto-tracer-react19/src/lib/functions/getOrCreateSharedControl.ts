/**
 * Gets or creates the shared control state on globalThis.
 *
 * Side effects: may create `globalThis.__autoTracerInternal.sharedControl`.
 *
 * The shared control state tracks whether the tracer is active, whether a passive
 * hook is installed, and stores the original DevTools hook for restoration.
 *
 * @returns Shared control state object
 */
export function getOrCreateSharedControl(): {
  isReactTracerActive: boolean;
  isPassiveHookInstalled: boolean;
  isIntendedToBeEnabled: boolean;
  hasInitializedOnce: boolean;
  originalOnCommitFiberRoot: unknown;
} {
  if (!globalThis.__autoTracerInternal) {
    globalThis.__autoTracerInternal = {
      outputMode: "devtools",
      subscribers: [],
    };
  }

  if (!globalThis.__autoTracerInternal.sharedControl) {
    globalThis.__autoTracerInternal.sharedControl = {
      isReactTracerActive: false,
      isPassiveHookInstalled: false,
      isIntendedToBeEnabled: false,
      hasInitializedOnce: false,
      originalOnCommitFiberRoot: null,
    };
  }

  return globalThis.__autoTracerInternal.sharedControl;
}
