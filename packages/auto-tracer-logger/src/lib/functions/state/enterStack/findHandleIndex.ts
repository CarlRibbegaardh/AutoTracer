import type { ExitHandle } from "../../../types/ExitHandle.js";
import { getEnterStack } from "./stack.js";

/**
 * Finds the index of a handle in the stack.
 * Returns -1 if not found.
 *
 * @param handle - The exit handle to find
 * @returns The index in the stack, or -1 if not found
 * @internal
 */
export function findHandleIndex(handle: ExitHandle): number {
  return getEnterStack().indexOf(handle);
}
