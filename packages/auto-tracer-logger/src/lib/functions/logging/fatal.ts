import { applyTheme } from "../helpers/applyTheme.js";
import { shouldLog } from "../helpers/shouldLog.js";

/**
 * Logs a fatal-level message.
 * Fatal messages indicate unrecoverable errors that terminate execution.
 * Only outputs if current log level is 'fatal' or higher.
 * Applies theme color and prefix if configured.
 *
 * @param message - The primary message to log
 * @param optionalParams - Additional parameters to log
 */
export function fatal(message?: unknown, ...optionalParams: unknown[]): void {
  if (shouldLog("fatal")) {
    applyTheme("fatal", message, ...optionalParams);
  }
}
