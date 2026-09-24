/**
 * Safely creates a new console group.
 * Wraps console.group with try-catch to prevent grouping failures from breaking the application.
 *
 * @param label - The label for the group
 * @param optionalParams - Additional parameters for console.group (e.g., CSS styling)
 */
export function safeGroup(label?: string, ...optionalParams: unknown[]): void {
  try {
    console.group(label, ...optionalParams);
  } catch {
    // Silently ignore console errors to prevent breaking application
  }
}
