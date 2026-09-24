import type { ExitHandle } from "../../../types/ExitHandle.js";
import { getEnterStack } from "./stack.js";

/**
 * Gets the handle at the top of the stack without removing it.
 * Returns undefined if stack is empty.
 *
 * @returns The most recent enter handle, or undefined if stack is empty
 * @internal
 */
export function peekStack(): ExitHandle | undefined {
  const stack = getEnterStack();
  return stack[stack.length - 1];
}
