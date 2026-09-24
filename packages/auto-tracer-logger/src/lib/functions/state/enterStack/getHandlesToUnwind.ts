import type { ExitHandle } from "../../../types/ExitHandle.js";
import { getEnterStack } from "./stack.js";

/**
 * Gets all handles from the top of the stack down to (and including) the specified index.
 * Returns handles in top-to-bottom order (reverse of stack order).
 *
 * @param toIndex - The index to unwind to (inclusive)
 * @returns Array of handles to unwind
 * @internal
 */
export function getHandlesToUnwind(toIndex: number): ExitHandle[] {
  const stack = getEnterStack();
  const handles: ExitHandle[] = [];
  for (let i = stack.length - 1; i >= toIndex; i--) {
    const handle = stack[i];
    if (handle) {
      handles.push(handle);
    }
  }
  return handles;
}
