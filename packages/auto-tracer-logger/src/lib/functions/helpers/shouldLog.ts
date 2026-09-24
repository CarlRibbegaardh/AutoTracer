import type { LogLevel } from "../../types/LogLevel.js";
import { getLogLevel } from "../state/getLogLevel.js";

/**
 * Log level hierarchy ordered from least to most verbose.
 */
const LOG_LEVEL_HIERARCHY: readonly LogLevel[] = [
  "off",
  "fatal",
  "error",
  "warn",
  "log",
  "info",
  "debug",
  "verbose",
  "trace",
] as const;

/**
 * Determines if a message at the given level should be logged.
 * Compares the message level against the current log level.
 *
 * @param messageLevel - The log level of the message to check
 * @returns True if the message should be output, false otherwise
 */
export function shouldLog(messageLevel: LogLevel): boolean {
  const currentLevel = getLogLevel();
  const currentLevelIndex = LOG_LEVEL_HIERARCHY.indexOf(currentLevel);
  const messageLevelIndex = LOG_LEVEL_HIERARCHY.indexOf(messageLevel);

  return messageLevelIndex <= currentLevelIndex;
}
