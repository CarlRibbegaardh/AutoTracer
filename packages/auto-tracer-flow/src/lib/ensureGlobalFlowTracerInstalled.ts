import { getOrCreateAutoTracerGlobalApi } from "./getOrCreateAutoTracerGlobalApi.js";
import { subscribeToOutputModeChanges } from "./subscribeToOutputModeChanges.js";
import { mapOutputModeToTreeRenderingMode } from "./treeRenderingMode/mapOutputModeToTreeRenderingMode.js";
import { mapTreeRenderingModeToFlowGroupMode } from "./treeRenderingMode/mapTreeRenderingModeToFlowGroupMode.js";
import { createFlowRuntimeControls } from "./createFlowRuntimeControls.js";
import { getOrCreateGlobalFlowTracer } from "./getOrCreateGlobalFlowTracer.js";
import { isRecord } from "./isRecord.js";
import { createRuntimeNameFilterStore } from "@autotracer/filter-utils";
import { createRuntimeFilteredFlowTracer } from "./runtimeFiltering/createRuntimeFilteredFlowTracer.js";
import {
  clearAllTriggersFromStorage,
  getAutoStopAllFromStorage,
  getAutoStopTopLevelFromStorage,
  getEnabledOnLoadFromStorage,
  getEndTriggerFromStorage,
  getEndTriggerModeFromStorage,
  getStartTriggerFromStorage,
  getTriggerRearmModeFromStorage,
  saveAutoStopAllToStorage,
  saveAutoStopTopLevelToStorage,
  saveEnabledOnLoadToStorage,
  saveEndTriggerModeToStorage,
  saveEndTriggerToStorage,
  saveStartTriggerToStorage,
  saveTriggerRearmModeToStorage,
} from "./RuntimeControl.js";

const flowRuntimeFilteringInstallMarker =
  "__autotracer.flow.runtimeFiltering.installMarker.v2" as const;
const flowRuntimeFilteringInstallVersion =
  "2026-03-27-filterMode-styled-line" as const;

type StorageLike = {
  readonly getItem: (key: string) => string | null;
  readonly setItem: (key: string, value: string) => void;
  readonly removeItem: (key: string) => void;
};

function getLocalStorageOrUndefined(): StorageLike | undefined {
  try {
    const candidate: unknown = Reflect.get(globalThis, "localStorage");
    if (!isRecord(candidate)) return undefined;
    const getItem = Reflect.get(candidate, "getItem");
    const setItem = Reflect.get(candidate, "setItem");
    const removeItem = Reflect.get(candidate, "removeItem");
    if (
      typeof getItem === "function" &&
      typeof setItem === "function" &&
      typeof removeItem === "function"
    ) {
      return {
        getItem: (key) => {
          const result: unknown = Reflect.apply(getItem, candidate, [key]);
          return typeof result === "string" ? result : null;
        },
        setItem: (key, value) => {
          Reflect.apply(setItem, candidate, [key, value]);
        },
        removeItem: (key) => {
          Reflect.apply(removeItem, candidate, [key]);
        },
      };
    }

    return undefined;
  } catch (_error) {
    return undefined;
  }
}

function formatFlowRuntimeFiltersForCopyPaste(
  filters: readonly string[],
): string {
  const inner = filters
    .map((x) => {
      return JSON.stringify(x);
    })
    .join(", ");
  return `exclude: { functions: [${inner}] }`;
}

/**
 * Ensures the Flow tracer is installed on the canonical `window.autoTracer` surface.
 *
 * Side effects:
 * - Installs `globalThis.autoTracer` when missing.
 * - Installs `globalThis.__flowTracer` with the trace methods required by injected code.
 * - Installs `globalThis.autoTracer.flowTracer` with only runtime controls.
 * - Subscribes to outputMode changes and mutates logger grouping mode.
 */
export function ensureGlobalFlowTracerInstalled(): void {
  if (typeof globalThis === "undefined") return;

  const { logger, tracer } = getOrCreateGlobalFlowTracer();
  const autoTracer = getOrCreateAutoTracerGlobalApi();

  // Access internal methods through type assertion
  const tracerInternal = tracer as typeof tracer & {
    setAutoStopCallback(callback: (() => void) | null): void;
    setAutoStartCallback(callback: (() => void) | null): void;
    setIsEnabledCallback(callback: (() => boolean) | null): void;
    getTopLevelCount(): number;
    getTotalCount(): number;
    resetCounts(): void;
    updateCachedLimits(topLevel: number | null, all: number | null): void;
    syncLimitsFromStorage(): void;
    updateCachedStartTrigger(pattern: string | null): void;
    updateCachedEndTrigger(pattern: string | null): void;
    updateCachedEndTriggerMode(mode: "on-entry" | "on-exit"): void;
    updateCachedTriggerRearmMode(mode: "always" | "once"): void;
    syncTriggerSettingsFromStorage(): void;
  };

  const existingInstrumentationCandidate: unknown = Reflect.get(
    globalThis,
    "__flowTracer",
  );

  const hasInstrumentationTracer =
    isRecord(existingInstrumentationCandidate) &&
    typeof existingInstrumentationCandidate["enter"] === "function" &&
    typeof existingInstrumentationCandidate["exit"] === "function";

  const existingFlowTracerControlsCandidate: unknown = autoTracer.flowTracer;
  const hasFlowTracerControls =
    isRecord(existingFlowTracerControlsCandidate) &&
    typeof existingFlowTracerControlsCandidate["start"] === "function" &&
    typeof existingFlowTracerControlsCandidate["stop"] === "function" &&
    typeof existingFlowTracerControlsCandidate["isEnabled"] === "function" &&
    typeof existingFlowTracerControlsCandidate["addFilter"] === "function" &&
    typeof existingFlowTracerControlsCandidate["showFilters"] === "function" &&
    typeof existingFlowTracerControlsCandidate["clearFilters"] === "function" &&
    typeof existingFlowTracerControlsCandidate["filterMode"] === "function";

  const existingInstallMarker: unknown = Reflect.get(
    globalThis,
    flowRuntimeFilteringInstallMarker,
  );

  const isCurrentInstall = existingInstallMarker === flowRuntimeFilteringInstallVersion;

  if (hasInstrumentationTracer && hasFlowTracerControls && isCurrentInstall) {
    return;
  }

  // Determine initial enabled state: respect stored preference, default to false
  const storedEnabledOnLoad = getEnabledOnLoadFromStorage();
  const initiallyEnabled = storedEnabledOnLoad ?? false;

  const controls = createFlowRuntimeControls(logger, initiallyEnabled);

  // Wrap start() to reset counters and sync limits from storage
  const originalStart = controls.start;
  controls.start = () => {
    tracerInternal.resetCounts();
    tracerInternal.syncLimitsFromStorage();
    tracerInternal.syncTriggerSettingsFromStorage();
    originalStart();
  };

  const store = createRuntimeNameFilterStore({
    storage: getLocalStorageOrUndefined(),
    storageKey: "__autotracer.flow.runtimeFilters.v1",
  });

  let isFilterModeEnabled = false;

  function filterMode(enabled?: boolean): boolean {
    isFilterModeEnabled = enabled ?? true;
    return isFilterModeEnabled;
  }

  function addFilter(match: string): void {
    store.addFilter(match);
  }

  function clearFilters(): void {
    store.clearFilters();
  }

  function showFilters(): string {
    const snippet = formatFlowRuntimeFiltersForCopyPaste(store.getFilters());
    // Intentionally print the snippet as a copy/paste target.
    console.log(snippet);
    return snippet;
  }

  function createFilterAction(functionName: string): unknown {
    return `autoTracer.flowTracer.addFilter(${JSON.stringify(functionName)})`;
  }

  const runtimeFilteredTracer = createRuntimeFilteredFlowTracer({
    baseTracer: tracer,
    store,
    isFilterModeEnabled: () => {
      return isFilterModeEnabled;
    },
    createFilterAction,
    logger,
  });

  Reflect.set(globalThis, "__flowTracer", runtimeFilteredTracer);
  Reflect.set(
    globalThis,
    flowRuntimeFilteringInstallMarker,
    flowRuntimeFilteringInstallVersion,
  );

  // Set auto-stop callback
  tracerInternal.setAutoStopCallback(controls.stop);

  // Set auto-start callback (for triggers)
  tracerInternal.setAutoStartCallback(controls.start);

  // Set is-enabled callback (for trigger logic to query tracer state)
  tracerInternal.setIsEnabledCallback(controls.isEnabled);

  // Sync trigger settings from storage early so start trigger can work on page load
  tracerInternal.syncTriggerSettingsFromStorage();

  autoTracer.flowTracer = {
    start: controls.start,
    stop: controls.stop,
    isEnabled: controls.isEnabled,
    addFilter,
    showFilters,
    clearFilters,
    filterMode,
    setEnabledOnLoad: (value: boolean) => {
      saveEnabledOnLoadToStorage(value);
    },
    getEnabledOnLoad: () => {
      return getEnabledOnLoadFromStorage() ?? false;
    },
    setAutoStopTopLevel: (limit: number | null) => {
      saveAutoStopTopLevelToStorage(limit);
      tracerInternal.updateCachedLimits(
        limit,
        getAutoStopAllFromStorage()
      );
    },
    getAutoStopTopLevel: () => {
      return getAutoStopTopLevelFromStorage();
    },
    setAutoStopAll: (limit: number | null) => {
      saveAutoStopAllToStorage(limit);
      tracerInternal.updateCachedLimits(
        getAutoStopTopLevelFromStorage(),
        limit
      );
    },
    getAutoStopAll: () => {
      return getAutoStopAllFromStorage();
    },
    getTopLevelCount: () => {
      return tracerInternal.getTopLevelCount();
    },
    getTotalCount: () => {
      return tracerInternal.getTotalCount();
    },
    resetCounts: () => {
      tracerInternal.resetCounts();
    },
    setStartTrigger: (pattern: string | null) => {
      saveStartTriggerToStorage(pattern);
      tracerInternal.updateCachedStartTrigger(pattern);
    },
    getStartTrigger: () => {
      return getStartTriggerFromStorage();
    },
    setEndTrigger: (pattern: string | null) => {
      saveEndTriggerToStorage(pattern);
      tracerInternal.updateCachedEndTrigger(pattern);
    },
    getEndTrigger: () => {
      return getEndTriggerFromStorage();
    },
    setEndTriggerMode: (mode: "on-entry" | "on-exit") => {
      saveEndTriggerModeToStorage(mode);
      tracerInternal.updateCachedEndTriggerMode(mode);
    },
    getEndTriggerMode: () => {
      return getEndTriggerModeFromStorage();
    },
    setTriggerRearmMode: (mode: "always" | "once") => {
      saveTriggerRearmModeToStorage(mode);
      tracerInternal.updateCachedTriggerRearmMode(mode);
    },
    getTriggerRearmMode: () => {
      return getTriggerRearmModeFromStorage();
    },
    clearAllTriggers: () => {
      clearAllTriggersFromStorage();
      tracerInternal.updateCachedStartTrigger(null);
      tracerInternal.updateCachedEndTrigger(null);
      tracerInternal.updateCachedEndTriggerMode("on-exit");
      tracerInternal.updateCachedTriggerRearmMode("once");
    },
  };

  function applyOutputModeToFlowGroupMode(
    mode: "devtools" | "copy-paste",
  ): void {
    const treeRenderingMode = mapOutputModeToTreeRenderingMode(mode);
    const flowGroupMode =
      mapTreeRenderingModeToFlowGroupMode(treeRenderingMode);
    logger.setGroupMode(flowGroupMode);
  }

  applyOutputModeToFlowGroupMode(autoTracer.getOutputMode());
  subscribeToOutputModeChanges(applyOutputModeToFlowGroupMode);

  // Auto-start tracer if enabledOnLoad is set
  const enabledOnLoad = getEnabledOnLoadFromStorage();
  if (enabledOnLoad === true) {
    controls.start();
  }
}
