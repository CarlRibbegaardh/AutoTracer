/**
 * Represents a cached value with optional metadata for performance tracking.
 * @template T The type of the cached value
 */
export interface CacheEntry<T> {
  /**
   * The cached result value.
   */
  value: T;

  /**
   * Optional metadata tracked when functionCacheLogging is enabled.
   * Omitted when logging is disabled to minimize memory overhead.
   */
  meta?: {
    /**
     * Name of the function being cached (for logging display).
     * @example "stringify"
     */
    functionName: string;

    /**
     * Arguments used for this cache entry (for logging display).
     * Stored as array to preserve argument order and types.
     */
    args: unknown[];

    /**
     * Time taken to compute the value on first call (in milliseconds).
     * GLOBAL: Measured once when the value is first computed.
     * Measured using performance.now() for microsecond precision.
     */
    firstComputeTimeMs: number;

    /**
     * Access count tracked per caller.
     * PER-CALLER: Each caller that uses this cached value has its own count.
     * Key: caller name (e.g., "matchUniqueValue")
     * Value: number of times this caller accessed this cached value
     * Enables cross-caller sharing visibility in logs.
     */
    callerAccess: Map<string, number>;
  };
}
