import { applyTheme } from "../helpers/applyTheme.js";
import { shouldLog } from "../helpers/shouldLog.js";

/**
 * Logs an error-level message.
 * Error messages indicate critical failures that require attention.
 * Only outputs if current log level is 'error' or higher.
 * Applies theme color and prefix if configured.
 *
 * @param message - The primary message to log
 * @param optionalParams - Additional parameters to log
 */
export function error(message?: unknown, ...optionalParams: unknown[]): void {
  if (shouldLog("error")) {
    applyTheme("error", message, ...optionalParams);
  }
}
