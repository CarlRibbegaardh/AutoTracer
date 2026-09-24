// import type { LogLevel } from "@autotracer/logger";
// import type { FilterConfig } from "./FilterConfig.js";
import type { FlowThemeConfig } from "./FlowThemeConfig.js";

/**
 * Configuration for the FlowTracer runtime.
 * Controls logging behavior, filtering, diagnostic features, and visual theming.
 */
export interface FlowTracerConfig {
  // /**
  //  * Minimum log level for trace output.
  //  * @default 'debug'
  //  */
  // logLevel?: LogLevel;

  // /**
  //  * Enable function enter logging.
  //  * @default true
  //  */
  // logEnter?: boolean;

  // /**
  //  * Enable function exit logging.
  //  * @default true
  //  */
  // logExit?: boolean;

  // /**
  //  * Log execution timing (duration in ms).
  //  * @default true
  //  */
  // logTiming?: boolean;

  // /**
  //  * Log function parameters at enter().
  //  * @default false
  //  */
  // logParams?: boolean;

  // /**
  //  * Log return values at exit().
  //  * @default false
  //  */
  // logReturnValues?: boolean;

  // /**
  //  * Enable warnings when exit() is called with mismatched handle.
  //  * Detects unexpected function exits (exceptions, early returns, plugin bugs).
  //  * @default true
  //  */
  // warnOnMismatchedExit?: boolean;

  // /**
  //  * Auto-recover from call stack mismatches by clearing orphaned frames.
  //  * If false, mismatch warning is logged but stack is not modified.
  //  * @default true
  //  */
  // autoRecoverFromMismatch?: boolean;

  // /**
  //  * Include patterns - only trace functions matching these patterns.
  //  * If omitted or empty, all functions are traced (subject to exclude).
  //  */
  // include?: FilterConfig;

  // /**
  //  * Exclude patterns - skip functions matching these patterns.
  //  * Takes precedence over include patterns.
  //  */
  // exclude?: FilterConfig;

  /**
   * Visual theme configuration for console output.
   * Defines colors, icons, and styling for all trace message categories.
   * If omitted, uses DEFAULT_FLOW_THEME.
   */
  theme?: FlowThemeConfig;

  // /**
  //  * Function name pattern that automatically starts tracing.
  //  * Supports glob patterns (e.g., "handle*", "fetch*") for flexible matching.
  //  * When a function matching this pattern is entered, tracing starts automatically
  //  * (subject to all other filter settings).
  //  * @default null (no automatic start trigger)
  //  * @example "handleClick" - Exact function name
  //  * @example "handle*" - All functions starting with "handle"
  //  */
  // startTriggerFunctionName?: string | null;

  // /**
  //  * Function name pattern that automatically stops tracing.
  //  * Supports glob patterns (e.g., "handle*", "fetch*") for flexible matching.
  //  * When a function matching this pattern is entered or exited, tracing stops automatically.
  //  * @default null (no automatic end trigger)
  //  * @example "fetchData" - Exact function name
  //  * @example "fetch*" - All functions starting with "fetch"
  //  */
  // endTriggerFunctionName?: string | null;

  // /**
  //  * Controls when the end trigger stops tracing.
  //  * - "on-entry": Stop immediately when entering the end trigger function
  //  * - "on-exit": Stop after exiting the end trigger function
  //  * @default "on-exit"
  //  */
  // endTriggerMode?: "on-entry" | "on-exit";

  // /**
  //  * Controls whether start trigger automatically re-enables tracing after end trigger.
  //  * - "always": After end trigger stops tracing, start trigger will restart it (repeated sequences)
  //  * - "once": After end trigger, remain stopped until manual restart (one-shot debugging)
  //  * @default "once"
  //  */
  // triggerRearmMode?: "always" | "once";
}
