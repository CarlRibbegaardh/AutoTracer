/**
 * Group nesting state.
 * Tracks the current depth for text mode indentation.
 * Internal module state - not exported directly.
 */
let currentDepth = 0;

/**
 * Gets the current nesting depth.
 *
 * @returns The current depth level
 * @internal
 */
export function getDepth(): number {
  return currentDepth;
}

/**
 * Increments the nesting depth.
 * Called when entering a new group.
 *
 * @internal
 */
export function incrementDepth(): void {
  currentDepth++;
}

/**
 * Decrements the nesting depth.
 * Called when exiting a group.
 *
 * @internal
 */
export function decrementDepth(): void {
  if (currentDepth > 0) {
    currentDepth--;
  }
}

/**
 * Resets the nesting depth to zero.
 * Used for testing and cleanup.
 *
 * @internal
 */
export function resetDepth(): void {
  currentDepth = 0;
}
