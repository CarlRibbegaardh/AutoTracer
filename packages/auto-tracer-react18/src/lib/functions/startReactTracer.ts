import { getOrCreateSharedControl } from "./getOrCreateSharedControl.js";
import { syncAutoStopLimitFromStorage } from "./detectUpdatedComponents.js";
import { snapshotRenderCycleStart } from "../types/globalState.js";
import { syncTriggerSettingsFromStorage } from "./detectUpdatedComponents.js";
import { setIsGlobalTracerInstalled } from "../types/globalState.js";
import { internalLogger } from "@logger/internalLogger.js";

/**
 * Start the reactTracer runtime.
 * Used by runtime control API to re-enable tracing after stop.
 *
 * Side effects: activates tracer, syncs settings, may reinstall hook or reinitialize.
 * Recursive: may call reactTracer() to reinstall hooks.
 */
export function startReactTracer(): void {
  const sharedControl = getOrCreateSharedControl();

  internalLogger.info(`[DEBUG startReactTracer] isReactTracerActive: ${sharedControl.isReactTracerActive}`);
  internalLogger.info(`[DEBUG startReactTracer] isPassiveHookInstalled: ${sharedControl.isPassiveHookInstalled}`);
  internalLogger.info(`[DEBUG startReactTracer] isIntendedToBeEnabled (before): ${sharedControl.isIntendedToBeEnabled}`);

  // If already active, nothing to do
  if (sharedControl.isReactTracerActive) {
    internalLogger.info("[DEBUG startReactTracer] Already active, returning");
    return;
  }

  sharedControl.isIntendedToBeEnabled = true;
  internalLogger.info(`[DEBUG startReactTracer] Set isIntendedToBeEnabled = true`);

  // Sync auto-stop limit when starting fresh (counter is monotonic — never reset on restart)
  syncAutoStopLimitFromStorage();
  // Snapshot the current render count so the auto-stop limit counts renders-since-start
  snapshotRenderCycleStart();
  syncTriggerSettingsFromStorage();

  // If the hook is already installed in passive mode, promote to active without reinstalling.
  if (sharedControl.isPassiveHookInstalled) {
    sharedControl.isPassiveHookInstalled = false;
    sharedControl.isReactTracerActive = true;
    setIsGlobalTracerInstalled(true);
    internalLogger.info(
      "ReactTracer: Global render monitor activated (was in passive mode)",
    );
    return;
  }

  // If we reach here, the hook is not installed at all.
  // This should not happen in normal operation since reactTracer() must be called first.
  internalLogger.warn(
    "startReactTracer: No hook installed. Call reactTracer() with enabled: false first, or configure a start trigger to install passive hook.",
  );
}
