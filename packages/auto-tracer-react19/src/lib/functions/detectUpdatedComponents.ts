import { clearRenderRegistry } from "./renderRegistry.js";
import { logGroup, logGroupEnd } from "./log.js";
import { buildTreeFromFiber } from "./treeProcessing/building/buildTreeFromFiber.js";
import { applyEmptyNodeFilter } from "./treeProcessing/filtering/applyEmptyNodeFilter.js";
import { renderTree } from "./treeProcessing/rendering/renderTree.js";
import {
  getRenderCycleInfo,
  getRenderCyclesDelta,
  getTraceOptions,
  incrementRenderCycle,
  markCycleAsDisplayed,
} from "../types/globalState.js";
import { internalLogger } from "@logger/internalLogger.js";
import { clearFunctionCache } from "./functionCache/clearFunctionCache.js";
import {
  getAutoStopRendersFromStorage,
  getEndTriggerFromStorage,
  getEndTriggerModeFromStorage,
  getStartTriggerFromStorage,
  getTriggerRearmModeFromStorage,
} from "../RuntimeControl.js";
import { matchesTrigger } from "./triggers/matchesTrigger.js";
import { getOrCreateSharedControl } from "./getOrCreateSharedControl.js";
import {
  isTriggeredByStart,
  resetTriggerState,
  setTriggeredByStart,
} from "./triggers/triggerState.js";
import type { TreeNode } from "./treeProcessing/types/TreeNode.js";

/**
 * Auto-stop callback.
 * Set by reactTracer to allow detectUpdatedComponents to stop tracing.
 */
let autoStopCallback: (() => void) | null = null;

/**
 * Auto-start callback (for triggers).
 * Set by reactTracer to allow detectUpdatedComponents to start tracing.
 */
let autoStartCallback: (() => void) | null = null;

/**
 * Cached auto-stop limit.
 * Synced from localStorage on start, updated when changed.
 */
let cachedAutoStopLimit: number | null = null;

/**
 * Cached start trigger pattern.
 * Synced from localStorage on start, updated when changed.
 */
let cachedStartTrigger: string | null = null;

/**
 * Cached end trigger pattern.
 * Synced from localStorage on start, updated when changed.
 */
let cachedEndTrigger: string | null = null;

/**
 * Cached end trigger mode.
 * Synced from localStorage on start, updated when changed.
 */
let cachedEndTriggerMode: "on-entry" | "on-exit" = "on-exit";

/**
 * Cached trigger re-arm mode.
 * Synced from localStorage on start, updated when changed.
 */
let cachedTriggerRearmMode: "always" | "once" = "once";

/**
 * Sets the auto-stop callback function.
 *
 * @param callback - Function to call when auto-stop limit is reached
 */
export function setAutoStopCallback(callback: (() => void) | null): void {
  autoStopCallback = callback;
}

/**
 * Sets the auto-start callback function (for triggers).
 *
 * @param callback - Function to call when start trigger is matched
 */
export function setAutoStartCallback(callback: (() => void) | null): void {
  autoStartCallback = callback;
}

/**
 * Updates the cached auto-stop limit.
 *
 * @param limit - New auto-stop limit, or null to disable
 */
export function updateCachedAutoStopLimit(limit: number | null): void {
  cachedAutoStopLimit = limit;
}

/**
 * Updates the cached start trigger pattern.
 *
 * @param pattern - New start trigger pattern, or null to disable
 */
export function updateCachedStartTrigger(pattern: string | null): void {
  cachedStartTrigger = pattern;
}

/**
 * Returns the currently cached start trigger pattern.
 *
 * @returns The cached start trigger pattern, or null if not set
 */
export function getCachedStartTrigger(): string | null {
  return cachedStartTrigger;
}

/**
 * Updates the cached end trigger pattern.
 *
 * @param pattern - New end trigger pattern, or null to disable
 */
export function updateCachedEndTrigger(pattern: string | null): void {
  cachedEndTrigger = pattern;
}

/**
 * Updates the cached end trigger mode.
 *
 * @param mode - New end trigger mode
 */
export function updateCachedEndTriggerMode(mode: "on-entry" | "on-exit"): void {
  cachedEndTriggerMode = mode;
}

/**
 * Updates the cached trigger re-arm mode.
 *
 * @param mode - New trigger re-arm mode
 */
export function updateCachedTriggerRearmMode(mode: "always" | "once"): void {
  cachedTriggerRearmMode = mode;
}

/**
 * Syncs cached auto-stop limit from localStorage.
 * Called when tracer starts.
 */
export function syncAutoStopLimitFromStorage(): void {
  cachedAutoStopLimit = getAutoStopRendersFromStorage();
}

/**
 * Syncs cached trigger settings from localStorage.
 * Called when tracer starts.
 */
export function syncTriggerSettingsFromStorage(): void {
  cachedStartTrigger = getStartTriggerFromStorage();
  cachedEndTrigger = getEndTriggerFromStorage();
  cachedEndTriggerMode = getEndTriggerModeFromStorage();
  cachedTriggerRearmMode = getTriggerRearmModeFromStorage();
}

/**
 * Checks if any node in the tree matches the given trigger pattern.
 *
 * @param nodes - Tree nodes to check
 * @param triggerPattern - Trigger pattern to match
 * @returns True if any node matches the trigger
 */
function checkTriggerMatch(
  nodes: readonly TreeNode[],
  triggerPattern: string | null,
): boolean {
  if (!triggerPattern) {
    return false;
  }

  for (const node of nodes) {
    if (matchesTrigger(node.displayName, triggerPattern)) {
      return true;
    }
  }

  return false;
}

export function detectUpdatedComponents(root: unknown): void {
  const mainHandle = internalLogger.enter("detectUpdatedComponents", "trace");

  try {
    const rootNode = root as { current?: unknown };
    if (!rootNode?.current) {
      internalLogger.exit(mainHandle);
      return;
    }

    // Count every legitimate render cycle, including passive ones, for accurate cycle numbering
    incrementRenderCycle();

    // Build tree first to check for triggers
    const buildHandle = internalLogger.enter("Tree building", "trace");
    const nodes = buildTreeFromFiber(rootNode.current, 0);
    internalLogger.exit(buildHandle);

    // Check for start trigger (if tracer is stopped and not in "once" mode after end trigger)
    const startTriggerPattern = cachedStartTrigger;
    const triggerRearmMode = cachedTriggerRearmMode;
    const isTracerEnabled = getOrCreateSharedControl().isIntendedToBeEnabled;

    const alreadyFiredOnce =
      triggerRearmMode === "once" && isTriggeredByStart();

    if (
      !isTracerEnabled &&
      startTriggerPattern &&
      !alreadyFiredOnce &&
      checkTriggerMatch(nodes, startTriggerPattern)
    ) {
      internalLogger.log(
        `Start trigger matched: ${startTriggerPattern}, starting tracer`,
      );
      setTriggeredByStart(true);
      // Start tracer immediately
      if (autoStartCallback) {
        autoStartCallback();
        // Continue processing this render
      }
    }

    // Re-query enabled state (may have changed if start trigger just fired)
    const isTracerEnabledNow = getOrCreateSharedControl().isIntendedToBeEnabled;

    internalLogger.info(`[DEBUG detectUpdatedComponents] isIntendedToBeEnabled: ${isTracerEnabledNow}`);

    if (!isTracerEnabledNow) {
      internalLogger.info("[DEBUG detectUpdatedComponents] Tracer disabled, returning early");
      clearRenderRegistry();
      internalLogger.exit(mainHandle);
      return;
    }

    // Check auto-stop limit against delta (renders since last start), not absolute total.
    // This ensures the limit counts renders within the current session, not all-time renders.
    if (cachedAutoStopLimit !== null) {
      const deltaCount = getRenderCyclesDelta();
      if (deltaCount >= cachedAutoStopLimit && autoStopCallback) {
        internalLogger.log(
          `Auto-stop triggered: reached ${deltaCount} renders since start (limit: ${cachedAutoStopLimit})`,
        );
        // Stop immediately to prevent excessive logging
        autoStopCallback();
      }
    }

    // Check for end trigger (before filtering, to catch all components)
    const endTriggerPattern = cachedEndTrigger;
    const endTriggerMode = cachedEndTriggerMode;

    if (
      endTriggerMode === "on-entry" &&
      checkTriggerMatch(nodes, endTriggerPattern)
    ) {
      // Stop before rendering — the trigger cycle is suppressed
      if (triggerRearmMode === "always") {
        resetTriggerState();
      }
      autoStopCallback?.();
      clearRenderRegistry();
      clearFunctionCache();
      internalLogger.exit(mainHandle);
      return;
    }

    // Step 2: Apply filtering based on settings
    const filterMode = getTraceOptions().filterEmptyNodes ?? "none";
    const filterHandle = internalLogger.enter(
      `Filtering (${filterMode})`,
      "trace",
    );
    const filterFn = applyEmptyNodeFilter(filterMode);
    const filtered = filterFn(nodes, {
      includeReconciled: getTraceOptions().includeReconciled ?? "never",
      includeSkipped: getTraceOptions().includeSkipped ?? "never",
      includeMount: getTraceOptions().includeMount ?? "never",
      includeRendered: getTraceOptions().includeRendered ?? "never",
    });
    internalLogger.debug(
      `Filtering (${filterMode}): ${nodes.length} → ${filtered.length} nodes`,
    );
    internalLogger.exit(filterHandle);

    // Only open the group if there are actual nodes to render (not just markers)
    // A tree containing ONLY markers means everything was filtered out
    const hasActualContent = filtered.some((node) => {
      return node.renderType !== "Marker";
    });
    if (hasActualContent) {
      const { cycleNumber, filteredCount } = getRenderCycleInfo();
      markCycleAsDisplayed();
      const cycleLabel =
        filteredCount > 0
          ? `Component render cycle ${cycleNumber} (${filteredCount} filtered):`
          : `Component render cycle ${cycleNumber}:`;
      logGroup(cycleLabel);
    }

    // Step 3: Render the filtered tree
    const renderHandle = internalLogger.enter("Rendering", "trace");
    renderTree(filtered);
    internalLogger.exit(renderHandle);

    clearRenderRegistry(); // Clear tracked fibers for next cycle
    clearFunctionCache(); // Clear function cache and log stats if enabled

    // Check for end trigger (on-exit mode, after rendering completes)
    if (
      endTriggerMode === "on-exit" &&
      checkTriggerMatch(nodes, endTriggerPattern)
    ) {
      internalLogger.log(
        `End trigger matched (on-exit): ${endTriggerPattern}, stopping tracer`,
      );
      // Stop immediately to prevent excessive logging
      if (triggerRearmMode === "always") {
        resetTriggerState();
      }
      autoStopCallback?.();
    }

    if (hasActualContent) {
      logGroupEnd();
    }

    internalLogger.exit(mainHandle);
  } catch (error) {
    logGroupEnd(); // Ensure console group is closed even on error
    internalLogger.error(
      "ReactTracer: Error during component detection:",
      error,
    );
    // Clean up state to prevent corruption
    try {
      clearRenderRegistry();
    } catch (cleanupError) {
      internalLogger.error("ReactTracer: Error during cleanup:", cleanupError);
    }
    internalLogger.exit(mainHandle);
  }
}
