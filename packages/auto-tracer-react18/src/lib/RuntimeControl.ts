/**
 * Global runtime control API for React18 component tracing.
 * Exposed via window.autoTracer.reactTracer when reactTracer is initialized.
 */
export interface ReactTracerAPI {
  /**
   * Start React18 component tracing.
   * Re-activates tracing if it was previously stopped.
   */
  start(): void;

  /**
   * Stop React18 component tracing.
   * Disables all component render monitoring.
   */
  stop(): void;

  /**
   * Check if tracing is currently enabled.
   *
   * @returns True if React18 tracing is active
   */
  isEnabled(): boolean;

  /**
   * Enable tracer on page load.
   * When true, tracer automatically starts on initialization.
   *
   * @param value - Enable or disable auto-start on load
   */
  setEnabledOnLoad(value: boolean): void;

  /**
   * Check if tracer is configured to start on page load.
   *
   * @returns True if tracer will auto-start on next page load
   */
  getEnabledOnLoad(): boolean;

  /**
   * Set auto-stop limit for render cycles.
   * When set, tracer will automatically stop after N renders.
   *
   * @param limit - Number of renders before auto-stop, or null to disable
   */
  setAutoStopAfterRenders(limit: number | null): void;

  /**
   * Get auto-stop render limit.
   *
   * @returns Number of renders before auto-stop, or null if disabled
   */
  getAutoStopAfterRenders(): number | null;

  /**
   * Get current render count since tracer was started.
   *
   * @returns Current render count
   */
  getRenderCount(): number;

  /**
   * Reset render count to zero.
   * Useful when restarting measurements.
   */
  resetRenderCount(): void;

  /**
   * Set start trigger function name pattern.
   * Supports glob patterns (e.g., "handle*") for flexible matching.
   *
   * @param pattern - Function name pattern to trigger start, or null to disable
   */
  setStartTrigger(pattern: string | null): void;

  /**
   * Get start trigger function name pattern.
   *
   * @returns Function name pattern, or null if not set
   */
  getStartTrigger(): string | null;

  /**
   * Set end trigger function name pattern.
   * Supports glob patterns (e.g., "handle*") for flexible matching.
   *
   * @param pattern - Function name pattern to trigger stop, or null to disable
   */
  setEndTrigger(pattern: string | null): void;

  /**
   * Get end trigger function name pattern.
   *
   * @returns Function name pattern, or null if not set
   */
  getEndTrigger(): string | null;

  /**
   * Set end trigger mode (when to stop tracing).
   *
   * @param mode - "on-entry" to stop when function is called, "on-exit" to stop after it completes
   */
  setEndTriggerMode(mode: "on-entry" | "on-exit"): void;

  /**
   * Get end trigger mode.
   *
   * @returns Current end trigger mode
   */
  getEndTriggerMode(): "on-entry" | "on-exit";

  /**
   * Set trigger re-arm mode (auto-restart behavior).
   *
   * @param mode - "always" for repeated sequences, "once" for one-shot debugging
   */
  setTriggerRearmMode(mode: "always" | "once"): void;

  /**
   * Get trigger re-arm mode.
   *
   * @returns Current trigger re-arm mode
   */
  getTriggerRearmMode(): "always" | "once";

  /**
   * Clear all trigger settings at once.
   * Resets start trigger, end trigger, and modes to defaults.
   */
  clearAllTriggers(): void;
}

/**
 * Storage key for React tracer enabled-on-load preference.
 */
export const STORAGE_KEY_REACT_ENABLED_ON_LOAD =
  "autotracer-react-enabled-on-load" as const;

/**
 * Storage key for React tracer auto-stop after N renders.
 */
export const STORAGE_KEY_REACT_AUTOSTOP_RENDERS =
  "autotracer-react-autostop-renders" as const;

/**
 * Storage key for React tracer start trigger pattern.
 */
export const STORAGE_KEY_REACT_START_TRIGGER =
  "autotracer-react-start-trigger" as const;

/**
 * Storage key for React tracer end trigger pattern.
 */
export const STORAGE_KEY_REACT_END_TRIGGER =
  "autotracer-react-end-trigger" as const;

/**
 * Storage key for React tracer end trigger mode.
 */
export const STORAGE_KEY_REACT_END_TRIGGER_MODE =
  "autotracer-react-end-trigger-mode" as const;

/**
 * Storage key for React tracer trigger re-arm mode.
 */
export const STORAGE_KEY_REACT_TRIGGER_REARM =
  "autotracer-react-trigger-rearm" as const;

/**
 * Get enabledOnLoad state from localStorage.
 *
 * @returns True if enabled, false if disabled, null if never set
 */
export function getEnabledOnLoadFromStorage(): boolean | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY_REACT_ENABLED_ON_LOAD);
    if (value === null) return null;
    return value === "true";
  } catch {
    return null;
  }
}

/**
 * Save enabledOnLoad state to localStorage.
 *
 * @param enabled - Whether tracer should auto-start on load
 */
export function saveEnabledOnLoadToStorage(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_REACT_ENABLED_ON_LOAD, String(enabled));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Get auto-stop render limit from localStorage.
 *
 * @returns Render limit number, or null if not set
 */
export function getAutoStopRendersFromStorage(): number | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY_REACT_AUTOSTOP_RENDERS);
    if (value === null) return null;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) || parsed <= 0 ? null : parsed;
  } catch {
    return null;
  }
}

/**
 * Save auto-stop render limit to localStorage.
 *
 * @param limit - Number of renders before auto-stop, or null to disable
 */
export function saveAutoStopRendersToStorage(limit: number | null): void {
  try {
    if (limit === null || limit <= 0) {
      localStorage.removeItem(STORAGE_KEY_REACT_AUTOSTOP_RENDERS);
    } else {
      localStorage.setItem(STORAGE_KEY_REACT_AUTOSTOP_RENDERS, String(limit));
    }
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Get start trigger pattern from localStorage.
 *
 * @returns Trigger pattern string, or null if not set
 */
export function getStartTriggerFromStorage(): string | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY_REACT_START_TRIGGER);
    return value === null || value.trim().length === 0 ? null : value;
  } catch {
    return null;
  }
}

/**
 * Save start trigger pattern to localStorage.
 *
 * @param pattern - Trigger pattern, or null to disable
 */
export function saveStartTriggerToStorage(pattern: string | null): void {
  try {
    if (pattern === null || pattern.trim().length === 0) {
      localStorage.removeItem(STORAGE_KEY_REACT_START_TRIGGER);
    } else {
      localStorage.setItem(STORAGE_KEY_REACT_START_TRIGGER, pattern);
    }
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Get end trigger pattern from localStorage.
 *
 * @returns Trigger pattern string, or null if not set
 */
export function getEndTriggerFromStorage(): string | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY_REACT_END_TRIGGER);
    return value === null || value.trim().length === 0 ? null : value;
  } catch {
    return null;
  }
}

/**
 * Save end trigger pattern to localStorage.
 *
 * @param pattern - Trigger pattern, or null to disable
 */
export function saveEndTriggerToStorage(pattern: string | null): void {
  try {
    if (pattern === null || pattern.trim().length === 0) {
      localStorage.removeItem(STORAGE_KEY_REACT_END_TRIGGER);
    } else {
      localStorage.setItem(STORAGE_KEY_REACT_END_TRIGGER, pattern);
    }
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Get end trigger mode from localStorage.
 *
 * @returns End trigger mode, or "on-exit" as default
 */
export function getEndTriggerModeFromStorage(): "on-entry" | "on-exit" {
  try {
    const value = localStorage.getItem(STORAGE_KEY_REACT_END_TRIGGER_MODE);
    return value === "on-entry" ? "on-entry" : "on-exit";
  } catch {
    return "on-exit";
  }
}

/**
 * Save end trigger mode to localStorage.
 *
 * @param mode - End trigger mode
 */
export function saveEndTriggerModeToStorage(
  mode: "on-entry" | "on-exit",
): void {
  try {
    localStorage.setItem(STORAGE_KEY_REACT_END_TRIGGER_MODE, mode);
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Get trigger re-arm mode from localStorage.
 *
 * @returns Trigger re-arm mode, or "once" as default
 */
export function getTriggerRearmModeFromStorage(): "always" | "once" {
  try {
    const value = localStorage.getItem(STORAGE_KEY_REACT_TRIGGER_REARM);
    return value === "always" ? "always" : "once";
  } catch {
    return "once";
  }
}

/**
 * Save trigger re-arm mode to localStorage.
 *
 * @param mode - Trigger re-arm mode
 */
export function saveTriggerRearmModeToStorage(mode: "always" | "once"): void {
  try {
    localStorage.setItem(STORAGE_KEY_REACT_TRIGGER_REARM, mode);
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Clear all trigger settings from localStorage.
 */
export function clearAllTriggersFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_REACT_START_TRIGGER);
    localStorage.removeItem(STORAGE_KEY_REACT_END_TRIGGER);
    localStorage.removeItem(STORAGE_KEY_REACT_END_TRIGGER_MODE);
    localStorage.removeItem(STORAGE_KEY_REACT_TRIGGER_REARM);
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Creates runtime control API that wraps reactTracer functionality.
 *
 * @param startFn - Function to start tracing
 * @param stopFn - Function to stop tracing
 * @param isEnabledFn - Function to check if tracing is enabled
 * @param getRenderCountFn - Function to get current render count
 * @param resetRenderCountFn - Function to reset render count
 * @param updateCachedLimitFn - Function to update cached auto-stop limit
 * @param updateCachedStartTriggerFn - Function to update cached start trigger
 * @param updateCachedEndTriggerFn - Function to update cached end trigger
 * @param updateCachedEndTriggerModeFn - Function to update cached end trigger mode
 * @param updateCachedTriggerRearmModeFn - Function to update cached trigger re-arm mode
 * @param installPassiveHookFn - Function to install the passive hook when a start trigger is set at runtime
 * @returns ReactTracerAPI instance
 */
export function createRuntimeControl(
  startFn: () => void,
  stopFn: () => void,
  isEnabledFn: () => boolean,
  getRenderCountFn: () => number,
  resetRenderCountFn: () => void,
  updateCachedLimitFn: (limit: number | null) => void,
  updateCachedStartTriggerFn: (pattern: string | null) => void,
  updateCachedEndTriggerFn: (pattern: string | null) => void,
  updateCachedEndTriggerModeFn: (mode: "on-entry" | "on-exit") => void,
  updateCachedTriggerRearmModeFn: (mode: "always" | "once") => void,
  installPassiveHookFn: () => void,
): ReactTracerAPI {
  return {
    start: startFn,
    stop: stopFn,
    isEnabled: isEnabledFn,
    setEnabledOnLoad: (value: boolean) => {
      saveEnabledOnLoadToStorage(value);
    },
    getEnabledOnLoad: () => {
      return getEnabledOnLoadFromStorage() ?? false;
    },
    setAutoStopAfterRenders: (limit: number | null) => {
      saveAutoStopRendersToStorage(limit);
      updateCachedLimitFn(limit);
    },
    getAutoStopAfterRenders: () => {
      return getAutoStopRendersFromStorage();
    },
    getRenderCount: getRenderCountFn,
    resetRenderCount: resetRenderCountFn,
    setStartTrigger: (pattern: string | null) => {
      saveStartTriggerToStorage(pattern);
      updateCachedStartTriggerFn(pattern);
      if (pattern !== null) {
        installPassiveHookFn();
      }
    },
    getStartTrigger: () => {
      return getStartTriggerFromStorage();
    },
    setEndTrigger: (pattern: string | null) => {
      saveEndTriggerToStorage(pattern);
      updateCachedEndTriggerFn(pattern);
    },
    getEndTrigger: () => {
      return getEndTriggerFromStorage();
    },
    setEndTriggerMode: (mode: "on-entry" | "on-exit") => {
      saveEndTriggerModeToStorage(mode);
      updateCachedEndTriggerModeFn(mode);
    },
    getEndTriggerMode: () => {
      return getEndTriggerModeFromStorage();
    },
    setTriggerRearmMode: (mode: "always" | "once") => {
      saveTriggerRearmModeToStorage(mode);
      updateCachedTriggerRearmModeFn(mode);
    },
    getTriggerRearmMode: () => {
      return getTriggerRearmModeFromStorage();
    },
    clearAllTriggers: () => {
      clearAllTriggersFromStorage();
      updateCachedStartTriggerFn(null);
      updateCachedEndTriggerFn(null);
      updateCachedEndTriggerModeFn("on-exit");
      updateCachedTriggerRearmModeFn("once");
    },
  };
}
