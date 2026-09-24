import type { Logger } from "@autotracer/logger";

/**
 * Configuration for runtime-controlled flow tracing.
 * Currently empty - reserved for future options.
 */
export interface RuntimeControlConfig {
  // Reserved for future configuration options
}

/**
 * Global runtime control API for flow tracing.
 * Exposed via window.autoTracer.flowTracer when runtime control is enabled.
 */
export interface FlowTracerAPI {
  /**
   * Start flow tracing with optional config override.
   */
  start(config?: RuntimeControlConfig): void;

  /**
   * Stop flow tracing.
   */
  stop(): void;

  /**
   * Check if tracing is currently enabled.
   */
  isEnabled(): boolean;

  /**
   * Get current runtime configuration.
   */
  getConfig(): RuntimeControlConfig;

  /**
   * Update configuration without restarting.
   */
  setConfig(config: Partial<RuntimeControlConfig>): void;

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
   * Set auto-stop limit for top-level function calls (depth 0).
   * When set, tracer will automatically stop after N top-level functions.
   *
   * @param limit - Number of top-level functions before auto-stop, or null to disable
   */
  setAutoStopTopLevel(limit: number | null): void;

  /**
   * Get auto-stop top-level limit.
   *
   * @returns Number of top-level functions before auto-stop, or null if disabled
   */
  getAutoStopTopLevel(): number | null;

  /**
   * Set auto-stop limit for all function calls (any depth).
   * When set, tracer will automatically stop after N total functions.
   *
   * @param limit - Number of total functions before auto-stop, or null to disable
   */
  setAutoStopAll(limit: number | null): void;

  /**
   * Get auto-stop all functions limit.
   *
   * @returns Number of total functions before auto-stop, or null if disabled
   */
  getAutoStopAll(): number | null;

  /**
   * Get current top-level function call count.
   *
   * @returns Current top-level call count since tracer was started
   */
  getTopLevelCount(): number;

  /**
   * Get current total function call count (all depths).
   *
   * @returns Current total call count since tracer was started
   */
  getTotalCount(): number;

  /**
   * Reset both counters to zero.
   * Useful when restarting measurements.
   */
  resetCounts(): void;

  /**
   * Set start trigger function name pattern.
   * Tracing will automatically start when a matching function is entered.
   * Supports glob patterns (e.g., "handle*", "*Click").
   *
   * @param pattern - Function name pattern to trigger start, or null to disable
   */
  setStartTrigger(pattern: string | null): void;

  /**
   * Get start trigger pattern.
   *
   * @returns Start trigger pattern, or null if not set
   */
  getStartTrigger(): string | null;

  /**
   * Set end trigger function name pattern.
   * Tracing will automatically stop when a matching function is encountered.
   * Supports glob patterns (e.g., "cleanup*", "*Unmount").
   *
   * @param pattern - Function name pattern to trigger stop, or null to disable
   */
  setEndTrigger(pattern: string | null): void;

  /**
   * Get end trigger pattern.
   *
   * @returns End trigger pattern, or null if not set
   */
  getEndTrigger(): string | null;

  /**
   * Set when the end trigger should fire.
   * "on-entry": Stop when end trigger function is entered
   * "on-exit": Stop when end trigger function exits (default)
   *
   * @param mode - End trigger timing mode
   */
  setEndTriggerMode(mode: "on-entry" | "on-exit"): void;

  /**
   * Get end trigger mode.
   *
   * @returns End trigger timing mode
   */
  getEndTriggerMode(): "on-entry" | "on-exit";

  /**
   * Set trigger re-arm behavior after end trigger fires.
   * "always": Allow start trigger to re-activate after stop (default)
   * "once": Disable triggers after first sequence completes
   *
   * @param mode - Trigger re-arm mode
   */
  setTriggerRearmMode(mode: "always" | "once"): void;

  /**
   * Get trigger re-arm mode.
   *
   * @returns Trigger re-arm mode
   */
  getTriggerRearmMode(): "always" | "once";

  /**
   * Clear all trigger settings and reset trigger state.
   */
  clearAllTriggers(): void;
}

/**
 * Storage key for Flow tracer enabled-on-load preference.
 */
export const STORAGE_KEY_FLOW_ENABLED_ON_LOAD = "autotracer-flow-enabled-on-load" as const;

/**
 * Storage key for Flow tracer auto-stop after N top-level functions.
 */
export const STORAGE_KEY_FLOW_AUTOSTOP_TOPLEVEL = "autotracer-flow-autostop-toplevel" as const;

/**
 * Storage key for Flow tracer auto-stop after N total functions.
 */
export const STORAGE_KEY_FLOW_AUTOSTOP_ALL = "autotracer-flow-autostop-all" as const;

/**
 * Storage key for Flow tracer start trigger pattern.
 */
export const STORAGE_KEY_FLOW_START_TRIGGER = "autotracer-flow-start-trigger" as const;

/**
 * Storage key for Flow tracer end trigger pattern.
 */
export const STORAGE_KEY_FLOW_END_TRIGGER = "autotracer-flow-end-trigger" as const;

/**
 * Storage key for Flow tracer end trigger mode.
 */
export const STORAGE_KEY_FLOW_END_TRIGGER_MODE = "autotracer-flow-end-trigger-mode" as const;

/**
 * Storage key for Flow tracer trigger re-arm mode.
 */
export const STORAGE_KEY_FLOW_TRIGGER_REARM = "autotracer-flow-trigger-rearm" as const;

/**
 * Get enabledOnLoad state from localStorage.
 *
 * @returns True if enabled, false if disabled, null if never set
 */
export function getEnabledOnLoadFromStorage(): boolean | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY_FLOW_ENABLED_ON_LOAD);
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
    localStorage.setItem(STORAGE_KEY_FLOW_ENABLED_ON_LOAD, String(enabled));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Get auto-stop top-level limit from localStorage.
 *
 * @returns Top-level function limit, or null if not set
 */
export function getAutoStopTopLevelFromStorage(): number | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY_FLOW_AUTOSTOP_TOPLEVEL);
    if (value === null) return null;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) || parsed <= 0 ? null : parsed;
  } catch {
    return null;
  }
}

/**
 * Save auto-stop top-level limit to localStorage.
 *
 * @param limit - Number of top-level functions before auto-stop, or null to disable
 */
export function saveAutoStopTopLevelToStorage(limit: number | null): void {
  try {
    if (limit === null || limit <= 0) {
      localStorage.removeItem(STORAGE_KEY_FLOW_AUTOSTOP_TOPLEVEL);
    } else {
      localStorage.setItem(STORAGE_KEY_FLOW_AUTOSTOP_TOPLEVEL, String(limit));
    }
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Get auto-stop all functions limit from localStorage.
 *
 * @returns Total function limit, or null if not set
 */
export function getAutoStopAllFromStorage(): number | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY_FLOW_AUTOSTOP_ALL);
    if (value === null) return null;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) || parsed <= 0 ? null : parsed;
  } catch {
    return null;
  }
}

/**
 * Save auto-stop all functions limit to localStorage.
 *
 * @param limit - Number of total functions before auto-stop, or null to disable
 */
export function saveAutoStopAllToStorage(limit: number | null): void {
  try {
    if (limit === null || limit <= 0) {
      localStorage.removeItem(STORAGE_KEY_FLOW_AUTOSTOP_ALL);
    } else {
      localStorage.setItem(STORAGE_KEY_FLOW_AUTOSTOP_ALL, String(limit));
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
    const value = localStorage.getItem(STORAGE_KEY_FLOW_START_TRIGGER);
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
      localStorage.removeItem(STORAGE_KEY_FLOW_START_TRIGGER);
    } else {
      localStorage.setItem(STORAGE_KEY_FLOW_START_TRIGGER, pattern);
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
    const value = localStorage.getItem(STORAGE_KEY_FLOW_END_TRIGGER);
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
      localStorage.removeItem(STORAGE_KEY_FLOW_END_TRIGGER);
    } else {
      localStorage.setItem(STORAGE_KEY_FLOW_END_TRIGGER, pattern);
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
    const value = localStorage.getItem(STORAGE_KEY_FLOW_END_TRIGGER_MODE);
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
export function saveEndTriggerModeToStorage(mode: "on-entry" | "on-exit"): void {
  try {
    localStorage.setItem(STORAGE_KEY_FLOW_END_TRIGGER_MODE, mode);
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
    const value = localStorage.getItem(STORAGE_KEY_FLOW_TRIGGER_REARM);
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
    localStorage.setItem(STORAGE_KEY_FLOW_TRIGGER_REARM, mode);
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Clear all trigger settings from localStorage.
 */
export function clearAllTriggersFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_FLOW_START_TRIGGER);
    localStorage.removeItem(STORAGE_KEY_FLOW_END_TRIGGER);
    localStorage.removeItem(STORAGE_KEY_FLOW_END_TRIGGER_MODE);
    localStorage.removeItem(STORAGE_KEY_FLOW_TRIGGER_REARM);
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Creates runtime control API for a Flow logger.
 *
 * @param logger - Logger instance for enable/disable control
 * @returns Basic runtime controls (subset of FlowTracerAPI)
 */
export function createRuntimeControl(logger: Logger): {
  start: (config?: RuntimeControlConfig) => void;
  stop: () => void;
  isEnabled: () => boolean;
  getConfig: () => RuntimeControlConfig;
  setConfig: (config: Partial<RuntimeControlConfig>) => void;
  setEnabledOnLoad: (value: boolean) => void;
  getEnabledOnLoad: () => boolean;
} {
  let currentConfig: RuntimeControlConfig = {};
  let isActive = false;

  /**
   * Start flow tracing.
   */
  function start(config: RuntimeControlConfig = {}): void {
    // Merge with existing config
    currentConfig = { ...currentConfig, ...config };

    // Enable logger
    logger.setLogLevel("trace");
    isActive = true;

    logger.log("Flow tracing started");
  }

  /**
   * Stop flow tracing.
   */
  function stop(): void {
    // Log message before disabling logger
    logger.log("Flow tracing stopped");

    // Disable logger
    logger.setLogLevel("off");
    isActive = false;
  }

  /**
   * Check if tracing is enabled.
   */
  function isEnabled(): boolean {
    return isActive;
  }

  /**
   * Get current configuration.
   */
  function getConfig(): RuntimeControlConfig {
    return { ...currentConfig };
  }

  /**
   * Update configuration.
   */
  function setConfig(config: Partial<RuntimeControlConfig>): void {
    currentConfig = { ...currentConfig, ...config };
  }

  /**
   * Enable tracer on page load.
   */
  function setEnabledOnLoad(value: boolean): void {
    saveEnabledOnLoadToStorage(value);
  }

  /**
   * Check if tracer is configured to start on page load.
   */
  function getEnabledOnLoad(): boolean {
    return getEnabledOnLoadFromStorage() ?? false;
  }

  return {
    start,
    stop,
    isEnabled,
    getConfig,
    setConfig,
    setEnabledOnLoad,
    getEnabledOnLoad,
  };
}
