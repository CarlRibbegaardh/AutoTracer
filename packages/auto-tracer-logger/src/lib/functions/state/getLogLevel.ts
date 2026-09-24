import { getLogLevelInternal } from "./logLevel.js";

/**
 * Gets the current log level.
 *
 * @returns The current log level
 */
export function getLogLevel() {
  return getLogLevelInternal();
}
