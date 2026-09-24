/**
 * Unique identifier for a function execution trace.
 * Returned by enter() and passed to exit() to match function boundaries.
 */
export interface TraceHandle {
  /**
   * Unique ID for this function invocation.
   * Used to detect mismatched exit() calls.
   */
  readonly id: number;

  /**
   * Name of the function being traced.
   * Used for diagnostic messages and logging.
   */
  readonly functionName: string;

  /**
   * Timestamp when enter() was called (ms since epoch).
   * Used to calculate execution duration.
   */
  readonly startTime: number;
}
