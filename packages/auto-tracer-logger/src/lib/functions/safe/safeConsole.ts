import type { LogLevel } from "../../types/LogLevel.js";
import { getConsoleMethod } from "../helpers/getConsoleMethod.js";

/**
 * Safely calls the appropriate console method for the given log level.
 * Wraps console methods with try-catch to prevent logging failures from breaking the application.
 *
 * @param level - The log level determining which console method to use
 * @param message - The primary message to log
 * @param optionalParams - Additional parameters to log
 */
export function safeConsole(
  level: LogLevel,
  message?: unknown,
  ...optionalParams: unknown[]
): void {
  try {
    const consoleMethod = getConsoleMethod(level);
    consoleMethod(message, ...optionalParams);
  } catch {
    // Silently ignore console errors to prevent breaking application
  }
}
