import { applyTheme } from "../helpers/applyTheme.js";
import { shouldLog } from "../helpers/shouldLog.js";

/**
 * Logs a trace-level message.
 * Finest-grained tracing information for detailed execution flow.
 * Only outputs if current log level is 'trace' or higher.
 * Applies theme color and prefix if configured.
 *
 * @param message - The primary message to log
 * @param optionalParams - Additional parameters to log
 */
export function trace(message?: unknown, ...optionalParams: unknown[]): void {
  if (shouldLog("trace")) {
    applyTheme("trace", message, ...optionalParams);
  }
}
