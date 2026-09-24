import { getEnterStack } from "./stack.js";

/**
 * Removes all handles from the top of the stack down to (and including) the specified index.
 *
 * @param toIndex - The index to truncate to (this element is removed)
 * @internal
 */
export function truncateStack(toIndex: number): void {
  getEnterStack().length = toIndex;
}
