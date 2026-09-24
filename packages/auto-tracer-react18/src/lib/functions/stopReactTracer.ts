import { getOrCreateSharedControl } from "./getOrCreateSharedControl.js";
import { resetTriggerState } from "./triggers/triggerState.js";
import { clearRenderRegistry } from "./renderRegistry.js";
import { setIsGlobalTracerInstalled } from "../types/globalState.js";
import { getCachedStartTrigger } from "./detectUpdatedComponents.js";
import { internalLogger } from "@logger/internalLogger.js";

/**
 * Stop the reactTracer and restore the original React DevTools hook.
 *
 * Side effects:
 * - Updates shared control state (isIntendedToBeEnabled, isReactTracerActive, isPassiveHookInstalled)
 * - Restores original DevTools hook
 * - Clears render registry
 * - Resets trigger state
 * - Updates global tracer installed flag
 *
 * Behavior varies based on current state:
 * - If in passive mode (hook installed but not active): fully removes hook
 * - If active with start trigger configured: demotes to passive mode
 * - If active without start trigger: fully removes hook
 * - If already stopped: no-op
 */
export function stopReactTracer(): void {
  const sharedControl = getOrCreateSharedControl();

  // Always update intended state, even if tracer wasn't actually active
  sharedControl.isIntendedToBeEnabled = false;

  // If in passive mode (hook installed but tracer not active), fully clean up
  if (sharedControl.isPassiveHookInstalled && !sharedControl.isReactTracerActive) {
    sharedControl.isPassiveHookInstalled = false;
    sharedControl.originalOnCommitFiberRoot = null;
    resetTriggerState();
    internalLogger.debug("ReactTracer: Cleaned up passive hook");
    return;
  }

  if (!sharedControl.isReactTracerActive) {
    // Nothing is running, ensure clean state
    sharedControl.isPassiveHookInstalled = false;
    return;
  }

  // Clear registries once upon stop to release retained references
  clearRenderRegistry();

  sharedControl.isReactTracerActive = false;
  setIsGlobalTracerInstalled(false);

  // Only keep hook in passive mode if it was actually installed (originalOnCommitFiberRoot exists)
  // This allows dashboard/runtime controls to restart tracing without reinstalling hooks
  if (sharedControl.originalOnCommitFiberRoot) {
    sharedControl.isPassiveHookInstalled = true;

    const triggerInfo = getCachedStartTrigger()
      ? " (start trigger active)"
      : "";
    internalLogger.info(
      `ReactTracer: Global render monitor stopped (passive mode${triggerInfo})`,
    );
  } else {
    // No hook was installed, nothing to keep in passive mode
    sharedControl.isPassiveHookInstalled = false;
    internalLogger.debug("ReactTracer: Stopped (no hook was installed)");
  }
}
