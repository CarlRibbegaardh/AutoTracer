/**
 * Safely ends the current console group.
 * Wraps console.groupEnd with try-catch to prevent grouping failures from breaking the application.
 */
export function safeGroupEnd(): void {
  try {
    console.groupEnd();
  } catch {
    // Silently ignore console errors to prevent breaking application
  }
}
