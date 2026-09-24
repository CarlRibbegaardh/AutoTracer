import type { ReactTracerOptions } from "../interfaces/ReactTracerOptions.js";
import { defaultReactTracerOptions } from "./defaultSettings.js";
import { internalLogger } from "@logger/internalLogger.js";
import type { ReactTracerInternalOptions } from "./ReactTracerInternalOptions.js";
import type { OutputMode } from "../autoTracer/OutputMode.js";
import { applyOutputModeToReactTracerOptions } from "../autoTracer/applyOutputModeToReactTracerOptions.js";

export let renderStartTime = 0;

// Render cycle counter state
let totalRenderCycles = 0;
let lastDisplayedCycle = 0;
// Snapshot of totalRenderCycles taken when tracing starts, used to compute the delta
let renderCycleStartSnapshot = 0;

// Dark mode detection utility
function isDarkMode(): boolean {
  try {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  } catch (_error) {
    // Return false if media query fails
    return false;
  }
}

// Initialize with default settings
/**
 * Gets the initial outputMode from a pre-seeded global state.
 *
 * This is intentionally seed-only: it reads from `globalThis.__autoTracerInternal`
 * when present, but does not create global state.
 *
 * @returns Seeded outputMode or the canonical default
 */
function getSeededOutputModeOrDevtools(): OutputMode {
  const internal = globalThis.__autoTracerInternal;
  const seededMode = internal?.outputMode;

  if (seededMode === "devtools" || seededMode === "copy-paste") {
    return seededMode;
  }

  return "devtools";
}

/**
 * Gets or creates the shared tracer state on globalThis.
 *
 * Side effects: may create `globalThis.__autoTracerInternal.sharedTracerState`.
 *
 * @returns Shared tracer state
 */
function getOrCreateSharedTracerState(): {
  isGlobalTracerInstalled: boolean;
  traceOptions: ReactTracerInternalOptions;
} {
  if (!globalThis.__autoTracerInternal) {
    globalThis.__autoTracerInternal = {
      outputMode: "devtools",
      subscribers: [],
    };
  }

  if (!globalThis.__autoTracerInternal.sharedTracerState) {
    globalThis.__autoTracerInternal.sharedTracerState = {
      isGlobalTracerInstalled: false,
      traceOptions: {
        ...defaultReactTracerOptions,
        ...applyOutputModeToReactTracerOptions(getSeededOutputModeOrDevtools()),
      },
    };
  }

  return globalThis.__autoTracerInternal.sharedTracerState;
}

/**
 * Gets the shared isGlobalTracerInstalled flag.
 *
 * @returns Current value of isGlobalTracerInstalled
 */
export function getIsGlobalTracerInstalled(): boolean {
  return getOrCreateSharedTracerState().isGlobalTracerInstalled;
}

/**
 * Gets the shared traceOptions object.
 *
 * @returns Current trace options
 */
export function getTraceOptions(): ReactTracerInternalOptions {
  return getOrCreateSharedTracerState().traceOptions;
}

// Backward compatibility: export direct values (but they won't update)
// Use getter functions for live values
export const isGlobalTracerInstalled = getIsGlobalTracerInstalled();
export const traceOptions = getTraceOptions();

// Export dark mode detection for use in other modules
export { isDarkMode };

export function setIsGlobalTracerInstalled(value: boolean): void {
  getOrCreateSharedTracerState().isGlobalTracerInstalled = value;
}

export function setRenderStartTime(value: number): void {
  renderStartTime = value;
}

/**
 * Sets the tracer options in shared state.
 * Pure write operation - caller must provide fully merged options.
 *
 * @param options - Complete options object to set
 */
export function setTracerOptions(options: ReactTracerInternalOptions): void {
  const sharedState = getOrCreateSharedTracerState();
  sharedState.traceOptions = options;
}

/**
 * Logs tracer options update for debugging.
 * Separate side effect - call after setTracerOptions if needed.
 *
 * @param options - Options to log
 */
export function logTracerOptionsUpdate(options: ReactTracerOptions): void {
  internalLogger.debug(
    "ReactTracer options updated:",
    JSON.stringify(options, null, 2),
  );
}

/**
 * Increments the total render cycle counter.
 * Called at the start of each render cycle regardless of filtering.
 */
export function incrementRenderCycle(): void {
  totalRenderCycles++;
}

/**
 * Gets the current render cycle number and filtered count.
 * Pure query - does not mutate state.
 *
 * @returns Object containing cycle number and filtered count
 */
export function getRenderCycleInfo(): {
  cycleNumber: number;
  filteredCount: number;
} {
  const filteredCount = totalRenderCycles - lastDisplayedCycle - 1;
  return {
    cycleNumber: totalRenderCycles,
    filteredCount: filteredCount > 0 ? filteredCount : 0,
  };
}

/**
 * Marks the current render cycle as displayed.
 * Pure command - mutates lastDisplayedCycle.
 */
export function markCycleAsDisplayed(): void {
  lastDisplayedCycle = totalRenderCycles;
}

/**
 * Resets the render cycle counter to zero.
 * Also resets the start snapshot so the delta is consistent.
 * Used for testing purposes.
 */
export function resetRenderCycleCounter(): void {
  totalRenderCycles = 0;
  lastDisplayedCycle = 0;
  renderCycleStartSnapshot = 0;
}

/**
 * Records the current total render count as the start-of-session baseline.
 * Called each time tracing starts (initial start or restart) so that the
 * auto-stop limit counts renders-since-start rather than all-time renders.
 */
export function snapshotRenderCycleStart(): void {
  renderCycleStartSnapshot = totalRenderCycles;
}

/**
 * Returns the number of render cycles that have occurred since the last
 * {@link snapshotRenderCycleStart} call.
 *
 * @returns Renders since the most recent start snapshot
 */
export function getRenderCyclesDelta(): number {
  return totalRenderCycles - renderCycleStartSnapshot;
}

/**
 * Gets the current total render count.
 *
 * @returns Total render cycles since last reset
 */
export function getTotalRenderCount(): number {
  return totalRenderCycles;
}
