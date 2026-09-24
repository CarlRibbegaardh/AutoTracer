import { applyTheme } from "../helpers/applyTheme.js";
import { shouldLog } from "../helpers/shouldLog.js";

/**
 * Logs a warn-level message.
 * Warning messages indicate potential issues that don't prevent operation.
 * Only outputs if current log level is 'warn' or higher.
 * Applies theme color and prefix if configured.
 *
 * @param message - The primary message to log
 * @param optionalParams - Additional parameters to log
 */
export function warn(message?: unknown, ...optionalParams: unknown[]): void {
  if (shouldLog("warn")) {
    applyTheme("warn", message, ...optionalParams);
  }
}
