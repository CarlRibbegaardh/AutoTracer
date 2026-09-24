import { applyTheme } from "../helpers/applyTheme.js";
import { shouldLog } from "../helpers/shouldLog.js";

/**
 * Logs a debug-level message.
 * Debug information for development and troubleshooting.
 * Only outputs if current log level is 'debug' or higher.
 * Applies theme color and prefix if configured.
 *
 * @param message - The primary message to log
 * @param optionalParams - Additional parameters to log
 */
export function debug(message?: unknown, ...optionalParams: unknown[]): void {
  if (shouldLog("debug")) {
    applyTheme("debug", message, ...optionalParams);
  }
}
