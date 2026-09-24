import { applyTheme } from "../helpers/applyTheme.js";
import { shouldLog } from "../helpers/shouldLog.js";

/**
 * Logs a log-level message.
 * Standard output equivalent to console.log.
 * Only outputs if current log level is 'log' or higher.
 * Applies theme color and prefix if configured.
 *
 * @param message - The primary message to log
 * @param optionalParams - Additional parameters to log
 */
export function log(message?: unknown, ...optionalParams: unknown[]): void {
  if (shouldLog("log")) {
    applyTheme("log", message, ...optionalParams);
  }
}
