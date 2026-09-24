import type { LogLevel } from "../../types/LogLevel.js";
import { setLogLevelInternal } from "./logLevel.js";

/**
 * Sets the current log level.
 * Only messages at or below this level will be output.
 *
 * @param level - The new log level to set
 */
export function setLogLevel(level: LogLevel): void {
  setLogLevelInternal(level);
}
