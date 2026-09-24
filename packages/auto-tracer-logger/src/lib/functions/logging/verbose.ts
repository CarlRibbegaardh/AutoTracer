import { applyTheme } from "../helpers/applyTheme.js";
import { shouldLog } from "../helpers/shouldLog.js";

/**
 * Logs a verbose-level message.
 * Detailed operational information for fine-grained logging.
 * Only outputs if current log level is 'verbose' or higher.
 * Applies theme color and prefix if configured.
 *
 * @param message - The primary message to log
 * @param optionalParams - Additional parameters to log
 */
export function verbose(message?: unknown, ...optionalParams: unknown[]): void {
  if (shouldLog("verbose")) {
    applyTheme("verbose", message, ...optionalParams);
  }
}
