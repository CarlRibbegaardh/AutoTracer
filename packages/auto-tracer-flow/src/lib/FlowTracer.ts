import type { Logger, StyledExitHandle } from "@autotracer/logger";
import type { FlowTracerConfig } from "./types/FlowTracerConfig.js";
import type { FlowThemeConfig } from "./types/FlowThemeConfig.js";
import { DEFAULT_FLOW_THEME } from "./constants/defaultTheme.js";
import { applyTheme } from "./functions/theme/applyTheme.js";
import { parseThemedMessage } from "./functions/theme/parseThemedMessage.js";
import { selectThemeMode } from "./functions/theme/selectThemeMode.js";
import { detectColorScheme } from "./functions/theme/detectColorScheme.js";
import { serializeUnknownToJson } from "./serializeUnknownToJson.js";
import {
  getAutoStopAllFromStorage,
  getAutoStopTopLevelFromStorage,
  getEndTriggerFromStorage,
  getEndTriggerModeFromStorage,
  getStartTriggerFromStorage,
  getTriggerRearmModeFromStorage,
} from "./RuntimeControl.js";
import { matchesTrigger } from "./triggers/matchesTrigger.js";
import {
  isTriggeredByStart,
  resetTriggerState,
  setTriggeredByStart,
} from "./triggers/triggerState.js";

/**
 * Stack frame representing a single function execution in the call stack.
 * Used internally to track nested function calls and detect mismatches.
 * @internal Reserved for future mismatch detection feature.
 */
interface _StackFrame {
  readonly id: number;
  readonly functionName: string;
  readonly startTime: number;
}

/**
 * Function flow tracer for automatic enter/exit tracking.
 * Integrates with @autotracer/logger for themed output.
 *
 * Usage:
 * ```ts
 * import { createLogger } from '@autotracer/logger';
 * import { createFlowTracer } from '@autotracer/flow';
 *
 * const logger = createLogger('MyApp');
 * const tracer = createFlowTracer(logger, { logLevel: 'debug' });
 *
 * function myFunction() {
 *   const h0 = tracer.enter('myFunction');
 *   try {
 *     // ... function body ...
 *   } catch (e) {
 *     tracer.debug('Exception in myFunction:', e);
 *     throw e;
 *   } finally {
 *     tracer.exit(h0);
 *   }
 * }
 * ```
 */
export interface FlowTracer {
  /**
   * Marks synchronous function entry and starts timing.
   *
   * @param functionName - Name of the function being entered
   * @returns Handle to pass to exit()
   */
  enter(functionName: string, ...optionalParams: unknown[]): StyledExitHandle;

  /**
   * Marks synchronous function exit and logs duration.
   *
   * @param handle - Handle returned by enter()
   */
  exit(handle: StyledExitHandle): void;

  /**
   * Marks async function entry and starts timing.
   *
   * @param functionName - Name of the async function being entered
   * @returns Handle to pass to exitAsync()
   */
  enterAsync(
    functionName: string,
    ...optionalParams: unknown[]
  ): StyledExitHandle;

  /**
   * Marks async function exit and logs duration.
   *
   * @param handle - Handle returned by enterAsync()
   */
  exitAsync(handle: StyledExitHandle): void;

  /**
   * Logs a function parameter with themed styling.
   *
   * @param name - Parameter name
   * @param value - Parameter value
   */
  traceParameter(name: string, value: unknown): void;

  /**
   * Logs a function return value with themed styling.
   *
   * @param value - Return value
   */
  traceReturnValue(value: unknown): void;

  /**
   * Logs an exception with themed styling.
   *
   * @param functionName - Name of the function where exception occurred
   * @param error - The exception/error object
   */
  traceException(functionName: string, error: unknown): void;

  /**
   * Logs a trace-level message (passthrough to logger).
   * Used for custom tracing output.
   *
   * @param message - Message to log
   * @param optionalParams - Additional parameters
   */
  trace(message?: unknown, ...optionalParams: unknown[]): void;

  /**
   * Logs a debug message (passthrough to logger).
   * Convenience method for custom debug output.
   *
   * @param message - Message to log
   * @param optionalParams - Additional parameters
   */
  debug(message?: unknown, ...optionalParams: unknown[]): void;
}

/**
 * Default configuration for FlowTracer.
 * @internal Reserved for future config override feature.
 */
const _DEFAULT_CONFIG = {
  // logLevel: "debug",
  // logEnter: true,
  // logExit: true,
  // logTiming: true,
  // logParams: false,
  // logReturnValues: false,
  // warnOnMismatchedExit: true,
  // autoRecoverFromMismatch: true,
  // include: {},
  // exclude: {},
  theme: DEFAULT_FLOW_THEME,
  // startTriggerFunctionName: null,
  // endTriggerFunctionName: null,
  // endTriggerMode: "on-exit",
  // triggerRearmMode: "once",
} satisfies Required<FlowTracerConfig> & { theme: Required<FlowThemeConfig> };

/**
 * Creates a function flow tracer instance.
 * Pure factory function with no side effects.
 *
 * @param logger - Logger instance for output
 * @param config - Configuration options
 * @returns FlowTracer instance
 */
export function createFlowTracer(
  logger: Logger,
  config?: FlowTracerConfig,
): FlowTracer {
  // Merge user config with defaults
  const mergedConfig: Required<FlowTracerConfig> = {
    ..._DEFAULT_CONFIG,
    ...config,
    theme: config?.theme
      ? { ..._DEFAULT_CONFIG.theme, ...config.theme }
      : _DEFAULT_CONFIG.theme,
  };

  // Detect color scheme for theme selection
  const colorScheme = detectColorScheme();

  // Pre-compute all theme formatters once at creation time to optimize hot path
  const precomputedThemes = {
    functionEnter: {
      options: selectThemeMode(
        mergedConfig.theme.functionEnter || _DEFAULT_CONFIG.theme.functionEnter,
        colorScheme,
      ),
      icon:
        mergedConfig.theme.functionEnter?.icon ??
        _DEFAULT_CONFIG.theme.functionEnter.icon,
    },
    functionExit: {
      options: selectThemeMode(
        mergedConfig.theme.functionExit || _DEFAULT_CONFIG.theme.functionExit,
        colorScheme,
      ),
      icon:
        mergedConfig.theme.functionExit?.icon ??
        _DEFAULT_CONFIG.theme.functionExit.icon,
    },
    asyncStart: {
      options: selectThemeMode(
        mergedConfig.theme.asyncStart || _DEFAULT_CONFIG.theme.asyncStart,
        colorScheme,
      ),
      icon:
        mergedConfig.theme.asyncStart?.icon ??
        _DEFAULT_CONFIG.theme.asyncStart.icon,
    },
    asyncComplete: {
      options: selectThemeMode(
        mergedConfig.theme.asyncComplete || _DEFAULT_CONFIG.theme.asyncComplete,
        colorScheme,
      ),
      icon:
        mergedConfig.theme.asyncComplete?.icon ??
        _DEFAULT_CONFIG.theme.asyncComplete.icon,
    },
    parameter: {
      options: selectThemeMode(
        mergedConfig.theme.parameter || _DEFAULT_CONFIG.theme.parameter,
        colorScheme,
      ),
      icon:
        mergedConfig.theme.parameter?.icon ??
        _DEFAULT_CONFIG.theme.parameter.icon,
    },
    returnValue: {
      options: selectThemeMode(
        mergedConfig.theme.returnValue || _DEFAULT_CONFIG.theme.returnValue,
        colorScheme,
      ),
      icon:
        mergedConfig.theme.returnValue?.icon ??
        _DEFAULT_CONFIG.theme.returnValue.icon,
    },
    exception: {
      options: selectThemeMode(
        mergedConfig.theme.exception || _DEFAULT_CONFIG.theme.exception,
        colorScheme,
      ),
      icon:
        mergedConfig.theme.exception?.icon ??
        _DEFAULT_CONFIG.theme.exception.icon,
    },
    runtimeControl: {
      options: selectThemeMode(
        mergedConfig.theme.runtimeControl ||
          _DEFAULT_CONFIG.theme.runtimeControl,
        colorScheme,
      ),
      icon:
        mergedConfig.theme.runtimeControl?.icon ??
        _DEFAULT_CONFIG.theme.runtimeControl.icon,
    },
  };

  // Internal state (closures) - currently unused but reserved for future mismatch detection
  // const nextId = 0;
  // const callStack: StackFrame[] = [];

  // Call depth and auto-stop tracking
  let currentDepth = 0;
  let topLevelCallCount = 0;
  let totalCallCount = 0;
  let autoStopCallback: (() => void) | null = null;
  let autoStartCallback: (() => void) | null = null;
  let isEnabledCallback: (() => boolean) | null = null;

  // Cached auto-stop limits (read once, updated via setters)
  let cachedTopLevelLimit: number | null = null;
  let cachedAllLimit: number | null = null;

  // Cached trigger settings (read once, updated via setters)
  let cachedStartTrigger: string | null = null;
  let cachedEndTrigger: string | null = null;
  let cachedEndTriggerMode: "on-entry" | "on-exit" = "on-exit";
  let cachedTriggerRearmMode: "always" | "once" = "once";

  /**
   * Gets the current canonical outputMode.
   *
   * Side effects: reads global AutoTracer internal state.
   *
   * @returns Current outputMode when available; otherwise defaults to "devtools".
   */
  function getOutputModeOrDevtools(): "devtools" | "copy-paste" {
    const mode = globalThis.__autoTracerInternal?.outputMode;
    return mode === "copy-paste" ? "copy-paste" : "devtools";
  }

  /**
   * Formats a trace value based on the canonical outputMode.
   * Sanitizes React elements to prevent logging internal fiber objects.
   *
   * Side effects: reads global AutoTracer internal state.
   *
   * @param value - The value to format.
   * @returns The original value in devtools mode (sanitized if React element); a JSON string for object values in copy-paste mode.
   */
  function formatValueForOutputMode(value: unknown): unknown {
    if (typeof value !== "object" || value === null) return value;

    // Sanitize React elements by removing internal fiber properties
    if (isReactElement(value)) {
      return sanitizeReactElement(value);
    }

    const mode = getOutputModeOrDevtools();
    if (mode !== "copy-paste") return value;

    return serializeUnknownToJson(value);
  }

  /**
   * Check if a value is a React element by detecting React-specific properties.
   */
  function isReactElement(value: unknown): boolean {
    if (typeof value !== "object" || value === null) return false;
    const obj = value as Record<string, unknown>;
    // Check for React element markers: $$typeof, _owner, type, props
    return (
      ("$$typeof" in obj || "_owner" in obj || "type" in obj) && "props" in obj
    );
  }

  /**
   * Remove React fiber internals from a React element to make it loggable.
   */
  function sanitizeReactElement(element: unknown): unknown {
    if (typeof element !== "object" || element === null) return element;

    const obj = element as Record<string, unknown>;
    const sanitized: Record<string, unknown> = {};

    // Keep only the essential React element properties
    if ("type" in obj) {
      const type = obj.type;
      // For function/class components, log the name or function
      if (typeof type === "function") {
        sanitized.type = type.name || `${type.toString().substring(0, 50)}...`;
      } else {
        sanitized.type = type;
      }
    }

    if ("props" in obj && typeof obj.props === "object" && obj.props !== null) {
      // Shallow copy props, but don't go into nested React elements
      const props = obj.props as Record<string, unknown>;
      const sanitizedProps: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(props)) {
        if (key === "children" && isReactElement(value)) {
          sanitizedProps.children = "[React Element]";
        } else if (Array.isArray(value)) {
          sanitizedProps[key] = value.map((v) => {
            return isReactElement(v) ? "[React Element]" : v;
          });
        } else if (isReactElement(value)) {
          sanitizedProps[key] = "[React Element]";
        } else {
          sanitizedProps[key] = value;
        }
      }
      sanitized.props = sanitizedProps;
    }

    if ("key" in obj) sanitized.key = obj.key;

    return sanitized;
  }

  /**
   * Marks synchronous function entry.
   */
  function enter(
    functionName: string,
    ...optionalParams: unknown[]
  ): StyledExitHandle {
    // Check for start trigger (if tracer is stopped and trigger is configured)
    const startTriggerPattern = cachedStartTrigger;
    const isTracerEnabled = isEnabledCallback?.() ?? false; // Default to false if callback not set
    const alreadyFiredOnce =
      cachedTriggerRearmMode === "once" && isTriggeredByStart();

    if (
      !isTracerEnabled &&
      startTriggerPattern &&
      !alreadyFiredOnce &&
      matchesTrigger(functionName, startTriggerPattern)
    ) {
      setTriggeredByStart(true);
      if (autoStartCallback) {
        autoStartCallback();
      }
    }

    // Check for end trigger (on-entry mode)
    const endTriggerPattern = cachedEndTrigger;
    const endTriggerMode = cachedEndTriggerMode;
    const triggerRearmMode = cachedTriggerRearmMode;

    // Re-query enabled state (may have changed if start trigger just fired)
    const isTracerEnabledNow = isEnabledCallback?.() ?? false;

    if (
      endTriggerMode === "on-entry" &&
      isTracerEnabledNow &&
      endTriggerPattern &&
      matchesTrigger(functionName, endTriggerPattern)
    ) {
      // Stop immediately to prevent excessive logging
      if (triggerRearmMode === "always") {
        resetTriggerState();
      }
      autoStopCallback?.();
    }

    // Track depth (incremented on entry, decremented on exit)
    currentDepth++;

    const { options, icon } = precomputedThemes.functionEnter;
    const themedMessage = applyTheme(functionName, options, icon);
    const { message, css } = parseThemedMessage(themedMessage);

    return css
      ? logger.enterStyled(functionName, message, css, ...optionalParams)
      : logger.enterStyled(functionName, message, ...optionalParams);
  }

  /**
   * Marks synchronous function exit.
   */
  function exit(handle: StyledExitHandle): void {
    // Decrement depth
    currentDepth = Math.max(0, currentDepth - 1);

    // Track counts (incremented on exit to count completed functions)
    const exitDepth = currentDepth; // Depth AFTER decrement
    totalCallCount++;
    if (exitDepth === 0) {
      topLevelCallCount++;
    }

    // Check auto-stop limits after function completes
    if (
      (cachedTopLevelLimit !== null &&
        topLevelCallCount >= cachedTopLevelLimit &&
        exitDepth === 0) ||
      (cachedAllLimit !== null && totalCallCount >= cachedAllLimit)
    ) {
      if (autoStopCallback) {
        // Stop immediately to prevent excessive logging
        const reason =
          cachedTopLevelLimit !== null &&
          topLevelCallCount >= cachedTopLevelLimit
            ? `top-level limit (${cachedTopLevelLimit})`
            : `total limit (${cachedAllLimit})`;
        logger.log(`Flow tracer auto-stop triggered: reached ${reason}`);
        autoStopCallback();
      }
    }

    const { options, icon } = precomputedThemes.functionExit;
    const themedMessage = applyTheme(handle.rawLabel, options, icon);
    const { message, css } = parseThemedMessage(themedMessage);

    if (css) {
      logger.exitStyled(handle, message, css);
    } else {
      logger.exitStyled(handle, message);
    }

    // Check for end trigger (on-exit mode)
    const endTriggerPattern = cachedEndTrigger;
    const endTriggerMode = cachedEndTriggerMode;
    const triggerRearmMode = cachedTriggerRearmMode;
    const isTracerEnabled = isEnabledCallback?.() ?? false; // Default to false if callback not set

    if (
      endTriggerMode === "on-exit" &&
      isTracerEnabled &&
      endTriggerPattern &&
      matchesTrigger(handle.rawLabel, endTriggerPattern)
    ) {
      // Stop after logging to include the last statement
      if (triggerRearmMode === "always") {
        resetTriggerState();
      }
      autoStopCallback?.();
    }
  }

  /**
   * Marks async function entry.
   * Uses flat trace message (NOT console.group) because async operations don't nest cleanly.
   * Spec: docs/work/spec/flow-theme-system-design.md lines 47-48
   */
  function enterAsync(
    functionName: string,
    ...optionalParams: unknown[]
  ): StyledExitHandle {
    const startTime = performance.now();
    const { options, icon } = precomputedThemes.asyncStart;
    const themedMessage = applyTheme(
      `${functionName} (async started)`,
      options,
      icon,
    );
    const { message, css } = parseThemedMessage(themedMessage);

    // Use trace() for flat output, NOT enterStyled() which creates console.group
    if (css) {
      logger.trace(message, css, ...optionalParams);
    } else {
      logger.trace(message, ...optionalParams);
    }

    // Return handle for timing without creating a group
    const handle: StyledExitHandle = {
      rawLabel: functionName,
      label: message,
      startTime,
      level: "trace",
    };
    return handle;
  }

  /**
   * Marks async function exit.
   * Uses flat trace message (NOT console.groupEnd) because async operations don't nest cleanly.
   * Spec: docs/work/spec/flow-theme-system-design.md lines 47-48
   */
  function exitAsync(handle: StyledExitHandle): void {
    const elapsed = performance.now() - handle.startTime;
    const { options, icon } = precomputedThemes.asyncComplete;
    const themedMessage = applyTheme(
      `${handle.rawLabel} (async completed, elapsed: ${elapsed.toFixed(1)}ms)`,
      options,
      icon,
    );
    const { message, css } = parseThemedMessage(themedMessage);

    // Use trace() for flat output, NOT exitStyled() which creates console.groupEnd
    if (css) {
      logger.trace(message, css);
    } else {
      logger.trace(message);
    }
  }

  /**
   * Logs a parameter with themed styling.
   */
  function traceParameter(name: string, value: unknown): void {
    const { options, icon } = precomputedThemes.parameter;
    const themedMessage = applyTheme(`param ${name}:`, options, icon);
    const { message, css } = parseThemedMessage(themedMessage);

    const formattedValue = formatValueForOutputMode(value);

    if (css) {
      logger.trace(message, css, formattedValue);
    } else {
      logger.trace(message, formattedValue);
    }
  }

  /**
   * Logs a return value with themed styling.
   */
  function traceReturnValue(value: unknown): void {
    const { options, icon } = precomputedThemes.returnValue;
    const themedMessage = applyTheme("returned:", options, icon);
    const { message, css } = parseThemedMessage(themedMessage);

    const formattedValue = formatValueForOutputMode(value);

    if (css) {
      logger.trace(message, css, formattedValue);
    } else {
      logger.trace(message, formattedValue);
    }
  }

  /**
   * Logs an exception with themed styling.
   */
  function traceException(functionName: string, error: unknown): void {
    const { options, icon } = precomputedThemes.exception;
    const themedMessage = applyTheme(
      `Exception in ${functionName}:`,
      options,
      icon,
    );
    const { message, css } = parseThemedMessage(themedMessage);

    const formattedError = formatValueForOutputMode(error);

    if (css) {
      logger.debug(message, css, formattedError);
    } else {
      logger.debug(message, formattedError);
    }
  }

  /**
   * Logs a trace message (passthrough to logger).
   */
  function trace(message?: unknown, ...optionalParams: unknown[]): void {
    logger.trace(message, ...optionalParams);
  }

  /**
   * Logs a debug message (passthrough to logger).
   */
  function debug(message?: unknown, ...optionalParams: unknown[]): void {
    logger.debug(message, ...optionalParams);
  }

  /**
   * Sets the auto-stop callback.
   * @internal Used by runtime controls
   */
  function setAutoStopCallback(callback: (() => void) | null): void {
    autoStopCallback = callback;
  }

  /**
   * Sets the auto-start callback (for triggers).
   * @internal Used by runtime controls
   */
  function setAutoStartCallback(callback: (() => void) | null): void {
    autoStartCallback = callback;
  }

  /**
   * Sets the is-enabled callback (for trigger logic to query tracer state).
   * @internal Used by runtime controls
   */
  function setIsEnabledCallback(callback: (() => boolean) | null): void {
    isEnabledCallback = callback;
  }

  /**
   * Gets current top-level call count.
   * @internal Used by runtime controls
   */
  function getTopLevelCount(): number {
    return topLevelCallCount;
  }

  /**
   * Gets current total call count.
   * @internal Used by runtime controls
   */
  function getTotalCount(): number {
    return totalCallCount;
  }

  /**
   * Resets all counters and depth.
   * @internal Used by runtime controls
   */
  function resetCounts(): void {
    currentDepth = 0;
    topLevelCallCount = 0;
    totalCallCount = 0;
  }

  /**
   * Updates cached auto-stop limits.
   * @internal Used by runtime controls when limits are changed
   */
  function updateCachedLimits(
    topLevel: number | null,
    all: number | null,
  ): void {
    cachedTopLevelLimit = topLevel;
    cachedAllLimit = all;
  }

  /**
   * Syncs cached limits from localStorage.
   * @internal Called when tracer starts
   */
  function syncLimitsFromStorage(): void {
    cachedTopLevelLimit = getAutoStopTopLevelFromStorage();
    cachedAllLimit = getAutoStopAllFromStorage();
  }

  /**
   * Updates cached start trigger pattern.
   * @internal Used by runtime controls when trigger is changed
   */
  function updateCachedStartTrigger(pattern: string | null): void {
    cachedStartTrigger = pattern;
  }

  /**
   * Updates cached end trigger pattern.
   * @internal Used by runtime controls when trigger is changed
   */
  function updateCachedEndTrigger(pattern: string | null): void {
    cachedEndTrigger = pattern;
  }

  /**
   * Updates cached end trigger mode.
   * @internal Used by runtime controls when mode is changed
   */
  function updateCachedEndTriggerMode(mode: "on-entry" | "on-exit"): void {
    cachedEndTriggerMode = mode;
  }

  /**
   * Updates cached trigger re-arm mode.
   * @internal Used by runtime controls when mode is changed
   */
  function updateCachedTriggerRearmMode(mode: "always" | "once"): void {
    cachedTriggerRearmMode = mode;
  }

  /**
   * Syncs cached trigger settings from localStorage.
   * @internal Called when tracer starts
   */
  function syncTriggerSettingsFromStorage(): void {
    cachedStartTrigger = getStartTriggerFromStorage();
    cachedEndTrigger = getEndTriggerFromStorage();
    cachedEndTriggerMode = getEndTriggerModeFromStorage();
    cachedTriggerRearmMode = getTriggerRearmModeFromStorage();
  }

  return {
    enter,
    exit,
    enterAsync,
    exitAsync,
    traceParameter,
    traceReturnValue,
    traceException,
    trace,
    debug,
    // Internal methods for runtime controls (not part of public interface)
    setAutoStopCallback,
    setAutoStartCallback,
    setIsEnabledCallback,
    getTopLevelCount,
    getTotalCount,
    resetCounts,
    updateCachedLimits,
    syncLimitsFromStorage,
    updateCachedStartTrigger,
    updateCachedEndTrigger,
    updateCachedEndTriggerMode,
    updateCachedTriggerRearmMode,
    syncTriggerSettingsFromStorage,
  } as FlowTracer & {
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
}

// Intentionally no auto-initialization.
