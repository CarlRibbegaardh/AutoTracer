import type { LogLevel } from "../../types/LogLevel.js";

/**
 * Current log level state.
 * Controls which log messages are output based on verbosity.
 * Internal module state - not exported directly.
 */
let currentLogLevel: LogLevel = "log";

/**
 * Gets the current log level.
 *
 * @returns The current log level
 * @internal
 */
export function getLogLevelInternal(): LogLevel {
  return currentLogLevel;
}

/**
 * Sets the current log level.
 * Only messages at or below this level will be output.
 *
 * @param level - The new log level to set
 * @internal
 */
export function setLogLevelInternal(level: LogLevel): void {
  currentLogLevel = level;
}
