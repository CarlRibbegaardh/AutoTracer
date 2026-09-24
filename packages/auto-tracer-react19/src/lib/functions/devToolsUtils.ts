/**
 * Centralized React DevTools access utility
 * Handles all DevTools interactions with proper error handling and safety checks
 */

import type { ReactDevToolsHook } from "../interfaces/ReactDevToolsHook.js";
import { internalLogger } from "@logger/internalLogger.js";

/**
 * Safely gets the React DevTools global hook
 * @returns DevTools hook object or null if not available
 */
export function getDevToolsHook(): ReactDevToolsHook | null {
  try {
    if (typeof window === "undefined") {
      return null;
    }

    return window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || null;
  } catch (error) {
    internalLogger.warn(
      "ReactTracer: Error accessing React DevTools hook:",
      error
    );
    return null;
  }
}

/**
 * Checks if React DevTools is available
 * @returns True if DevTools hook is available
 */
export function isDevToolsAvailable(): boolean {
  return getDevToolsHook() !== null;
}

/**
 * Safely installs a render hook with error handling
 * @param onCommitFiberRoot - The hook function to install
 * @param originalHook - Optional original hook to preserve
 * @returns The original hook that was replaced, or null
 */
export function installRenderHook(
  onCommitFiberRoot: ReactDevToolsHook["onCommitFiberRoot"],
  originalHook?: unknown
): unknown {
  try {
    const devtools = getDevToolsHook();
    if (!devtools) {
      return null;
    }

    // Store the current hook (might be original or another extension's hook)
    const currentHook = originalHook || devtools.onCommitFiberRoot;

    // Install our hook
    devtools.onCommitFiberRoot = onCommitFiberRoot;

    return currentHook;
  } catch (error) {
    internalLogger.error("ReactTracer: Error installing render hook:", error);
    return null;
  }
}

/**
 * Safely restores a previous render hook
 * @param originalHook - The original hook to restore
 * @returns True if successfully restored
 */
export function restoreRenderHook(originalHook: unknown): boolean {
  try {
    const devtools = getDevToolsHook();
    if (!devtools) {
      return false;
    }

    // Restore the original hook
    devtools.onCommitFiberRoot =
      originalHook as ReactDevToolsHook["onCommitFiberRoot"];
    return true;
  } catch (error) {
    internalLogger.error("ReactTracer: Error restoring render hook:", error);
    return false;
  }
}

/**
 * Creates a safe wrapper around a render hook function
 * Ensures that any errors in the hook don't break React's render cycle
 * @param hookFn - The hook function to wrap
 * @returns Wrapped hook function
 */
export function createSafeRenderHook(
  hookFn: (rendererID: number, root: unknown, priorityLevel?: number) => void,
  _deprecated: boolean = false // Deprecated parameter kept for API compatibility
): ReactDevToolsHook["onCommitFiberRoot"] {
  return (rendererID: number, root: unknown, priorityLevel?: number) => {
    try {
      hookFn(rendererID, root, priorityLevel);
    } catch (error) {
      // Never let reactTracer crashes break the user's React app
      internalLogger.error("ReactTracer: Error in render hook:", error);
      // Continue execution to not break React's render cycle
    }
  };
}

/**
 * Logs DevTools availability status
 */
export function logDevToolsStatus(
  _deprecated: boolean = false // Deprecated parameter kept for API compatibility
): void {
  if (isDevToolsAvailable()) {
    internalLogger.debug("ReactTracer: React DevTools detected");
  } else {
    internalLogger.warn(
      "ReactTracer: React DevTools not available. To use ReactTracer, either:\r\n" +
        "  1. Install the React DevTools browser extension, OR\r\n" +
        "  2. Use the @autotracer/plugin-vite-react19 or @autotracer/plugin-babel-react19 plugin\r\n" +
        "Automatic Tracing will not work without one of these options."
    );
  }
}
