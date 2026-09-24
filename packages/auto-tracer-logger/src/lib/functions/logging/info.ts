import { applyTheme } from "../helpers/applyTheme.js";
import { shouldLog } from "../helpers/shouldLog.js";

/**
 * Logs an info-level message.
 * Informational messages about normal operations.
 * Only outputs if current log level is 'info' or higher.
 * Applies theme color and prefix if configured.
 *
 * @param message - The primary message to log
 * @param optionalParams - Additional parameters to log
 */
export function info(message?: unknown, ...optionalParams: unknown[]): void {
  if (shouldLog("info")) {
    applyTheme("info", message, ...optionalParams);
  }
}
