/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactTracerOptions } from "./interfaces/ReactTracerOptions.js";
import type { OutputMode } from "./autoTracer/OutputMode.js";
import { detectUpdatedComponents } from "./functions/detectUpdatedComponents.js";
import { resolveTracerOptions } from "./resolveTracerOptions.js";
import { buildReactTracerApi } from "./buildReactTracerApi.js";
import {
  setAutoStartCallback,
  setAutoStopCallback,
  syncAutoStopLimitFromStorage,
  syncTriggerSettingsFromStorage,
  updateCachedAutoStopLimit,
  updateCachedEndTrigger,
  updateCachedEndTriggerMode,
  updateCachedStartTrigger,
  updateCachedTriggerRearmMode,
} from "./functions/detectUpdatedComponents.js";
import {
  getTotalRenderCount,
  getTraceOptions,
  logTracerOptionsUpdate,
  resetRenderCycleCounter,
  setIsGlobalTracerInstalled,
  setTracerOptions,
  snapshotRenderCycleStart,
} from "./types/globalState.js";
import {
  createSafeRenderHook,
  installRenderHook,
  isDevToolsAvailable,
  logDevToolsStatus,
} from "./functions/devToolsUtils.js";
import {
  applyInternalLogLevel,
  internalLogger,
} from "@logger/internalLogger.js";
import { createRuntimeControl } from "./RuntimeControl.js";
import { applyOutputModeToReactTracerOptions } from "./autoTracer/applyOutputModeToReactTracerOptions.js";
import { getOrCreateAutoTracerGlobalApi } from "./autoTracer/getOrCreateAutoTracerGlobalApi.js";
import { subscribeToOutputModeChanges } from "./autoTracer/subscribeToOutputModeChanges.js";
import { getReactRuntimeFilteringState } from "./runtimeFiltering/getReactRuntimeFilteringState.js";
import { getEnabledOnLoadFromStorage } from "./RuntimeControl.js";
import { getOrCreateSharedControl } from "./functions/getOrCreateSharedControl.js";
import { stopReactTracer } from "./functions/stopReactTracer.js";

// Re-export tracking functions for convenience
export { useReactTracer } from "./hooks/useReactTracer.js";
export { stopReactTracer } from "./functions/stopReactTracer.js";
export { isReactTracerInitialized } from "./functions/isReactTracerInitialized.js";
export { updateReactTracerOptions } from "./functions/updateReactTracerOptions.js";

/**
 * Initialize the reactTracer to capture all React renders including the initial render.
 * Call this before ReactDOM.render() or ReactDOM.createRoot().render() for best results.
 *
 * @param options Configuration options for the tracer
 * @returns Cleanup function to stop tracing
 */
export function reactTracer(options: ReactTracerOptions = {}): () => void {
  const sharedControl = getOrCreateSharedControl();

  // Only apply enabledOnLoad override on first initialization (page load)
  // Subsequent calls from runtime control should use the provided options
  const enabledOnLoad = sharedControl.hasInitializedOnce
    ? null
    : getEnabledOnLoadFromStorage();

  // Mark that we've initialized at least once
  sharedControl.hasInitializedOnce = true;

  const { validatedOptions, mergedOptions } = resolveTracerOptions(
    options,
    enabledOnLoad,
    getTraceOptions(),
  );

  // Apply internal log level (supports backward compat)
  applyInternalLogLevel(mergedOptions.internalLogLevel);

  // Update shared state
  setTracerOptions(mergedOptions);
  logTracerOptionsUpdate(options);

  /**
   * Installs the passive render hook if not already installed and conditions are met.
   *
   * Side effects: installs a React DevTools render hook, sets isPassiveHookInstalled.
   * No-op if the tracer is active, the hook is already installed, or DevTools is unavailable.
   */
  function tryInstallPassiveHook(): void {
    if (
      sharedControl.isReactTracerActive ||
      sharedControl.isPassiveHookInstalled ||
      !isDevToolsAvailable()
    ) {
      return;
    }
    const passiveHook = createSafeRenderHook(
      (rendererID: number, root: unknown, priorityLevel?: number) => {
        if (
          sharedControl.originalOnCommitFiberRoot &&
          typeof sharedControl.originalOnCommitFiberRoot === "function"
        ) {
          sharedControl.originalOnCommitFiberRoot(
            rendererID,
            root,
            priorityLevel,
          );
        }
        detectUpdatedComponents(root);
      },
      false,
    );
    sharedControl.originalOnCommitFiberRoot = installRenderHook(passiveHook);
    sharedControl.isPassiveHookInstalled = true;
  }

  /**
   * Start the reactTracer runtime.
   * Used by runtime control API to re-enable tracing after stop.
   *
   * Side effects: activates tracer, syncs settings, may reinstall hook or reinitialize.
   */
  function startReactTracer(): void {
    // If already active, nothing to do
    if (sharedControl.isReactTracerActive) {
      return;
    }

    sharedControl.isIntendedToBeEnabled = true;

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

    // Re-initialize with current options (but force enabled)
    const enabledOptions = { ...getTraceOptions(), enabled: true };
    reactTracer(enabledOptions);
  }

  // Install global runtime control API early (before enabled check)
  // This allows runtime control even when starting disabled
  const runtimeAPI = createRuntimeControl(
    startReactTracer,
    stopReactTracer,
    () => {
      return getOrCreateSharedControl().isIntendedToBeEnabled;
    },
    getTotalRenderCount,
    resetRenderCycleCounter,
    updateCachedAutoStopLimit,
    updateCachedStartTrigger,
    updateCachedEndTrigger,
    updateCachedEndTriggerMode,
    updateCachedTriggerRearmMode,
    tryInstallPassiveHook,
  );

  // Set auto-stop callback so detectUpdatedComponents can trigger stop
  setAutoStopCallback(stopReactTracer);

  // Set auto-start callback so detectUpdatedComponents can trigger start
  setAutoStartCallback(startReactTracer);

  // Sync trigger settings from storage early so start trigger can work on page load
  syncTriggerSettingsFromStorage();

  const runtimeFiltering = getReactRuntimeFilteringState();

  const autoTracer = getOrCreateAutoTracerGlobalApi();
  autoTracer.reactTracer = buildReactTracerApi(runtimeAPI, runtimeFiltering);

  if (validatedOptions.outputMode !== undefined) {
    autoTracer.setOutputMode(validatedOptions.outputMode);
  }

  /**
   * Applies the canonical outputMode to the internal ReactTracer options.
   *
   * Side effects: mutates global ReactTracer options.
   *
   * @param mode - Canonical output mode
   */
  function applyOutputMode(mode: OutputMode): void {
    const patch = applyOutputModeToReactTracerOptions(mode);
    const updated = { ...getTraceOptions(), ...patch };
    setTracerOptions(updated);
  }

  // Early exit if reactTracer is disabled
  if (getTraceOptions().enabled === false) {
    getOrCreateSharedControl().isIntendedToBeEnabled = false;

    // Apply the stored outputMode on install and keep mapped options in sync.
    subscribeToOutputModeChanges(applyOutputMode);

    internalLogger.debug("ReactTracer: Disabled via enabled: false option");

    // Always install hook in passive mode when disabled
    // This allows runtime .start() to activate tracing later
    // Also allows start triggers to work when configured
    tryInstallPassiveHook();

    return () => {}; // Return no-op cleanup function
  }

  // For enabled tracing, subscribe immediately (includes initial callback)
  // so the current canonical outputMode is applied.
  subscribeToOutputModeChanges(applyOutputMode);

  sharedControl.isIntendedToBeEnabled = true;

  if (sharedControl.isReactTracerActive) {
    internalLogger.debug(
      "ReactTracer is already active. Returning existing cleanup function.",
    );
    // Hook is already installed; just return cleanup function
    // This allows multiple modules (islands) to call reactTracer() and get
    // a reference to the shared runtime control
    return stopReactTracer;
  }

  // Check if React DevTools hook is available
  if (!isDevToolsAvailable()) {
    logDevToolsStatus(false); // Logger handles this now
    return () => {};
  }

  // Create a safe render hook that handles errors
  const safeRenderHook = createSafeRenderHook(
    (rendererID: number, root: unknown, priorityLevel?: number) => {
      const sharedControl = getOrCreateSharedControl();
      // Call original hook first if it exists
      if (
        sharedControl.originalOnCommitFiberRoot &&
        typeof sharedControl.originalOnCommitFiberRoot === "function"
      ) {
        sharedControl.originalOnCommitFiberRoot(
          rendererID,
          root,
          priorityLevel,
        );
      }

      // Detect and log updated components
      detectUpdatedComponents(root);
    },
    false, // Logger handles internal logging now
  );

  // Install our global render monitor
  sharedControl.originalOnCommitFiberRoot = installRenderHook(safeRenderHook);

  // Sync auto-stop limit from storage so it's applied on initial page load.
  // syncTriggerSettingsFromStorage() runs earlier (passive mode needs triggers),
  // but auto-stop only matters when the tracer is actually active.
  syncAutoStopLimitFromStorage();

  // Snapshot the current render count so the auto-stop limit counts renders-since-start
  snapshotRenderCycleStart();

  sharedControl.isReactTracerActive = true;
  setIsGlobalTracerInstalled(true);

  internalLogger.info("ReactTracer: Global render monitor initialized");

  return stopReactTracer;
}
