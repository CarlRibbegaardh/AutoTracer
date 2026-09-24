import { getLogger } from "@autotracer/logger";
import type { LogLevel } from "@autotracer/logger";

/**
 * Internal logger for ReactTracer diagnostics.
 * Log level is controlled by ReactTracerOptions.internalLogLevel.
 */
export const internalLogger = getLogger("auto-tracer");
internalLogger.setShowName(true); // Show [auto-tracer] prefix
internalLogger.setLogLevel("error"); // Default: quiet (updated by options)

/**
 * Apply log level from ReactTracer options.
 */
export function applyInternalLogLevel(internalLogLevel?: LogLevel): void {
  // Apply explicit log level or keep default
  if (internalLogLevel) {
    internalLogger.setLogLevel(internalLogLevel);
  }
}
