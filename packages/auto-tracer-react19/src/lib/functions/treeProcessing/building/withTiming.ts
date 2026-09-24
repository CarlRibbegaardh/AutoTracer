import { internalLogger } from "@logger/internalLogger.js";

/**
 * Higher-order function that wraps a function with performance timing.
 * Pure utility with no side effects beyond console logging when enabled.
 *
 * @param fn - The function to wrap with timing
 * @param label - Label to use in timing output
 * @param enabled - Whether timing is enabled
 * @returns Wrapped function that logs execution time when enabled
 */
export function withTiming<T extends (...args: never[]) => unknown>(
  fn: T,
  label: string,
  enabled: boolean
): T {
  if (!enabled) {
    return fn;
  }

  return ((...args: Parameters<T>) => {
    const h = internalLogger.enter(label);

    const result = fn(...args);

    // Get result count if it's an array
    const count =
      result && typeof result === "object" && Array.isArray(result)
        ? result.length
        : "result";

    internalLogger.trace(`${label}: ${count} items`);
    internalLogger.exit(h);

    return result;
  }) as T;
}
