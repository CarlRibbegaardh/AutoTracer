/**
 * Safely logs a message to the console.
 * Wraps console.log with try-catch to prevent logging failures from breaking the application.
 *
 * @param message - The primary message to log
 * @param optionalParams - Additional parameters to log
 */
export function safeLog(message?: unknown, ...optionalParams: unknown[]): void {
  try {
    console.log(message, ...optionalParams);
  } catch {
    // Silently ignore console errors to prevent breaking application
  }
}
