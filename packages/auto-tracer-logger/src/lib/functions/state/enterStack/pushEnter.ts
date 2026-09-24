import type { ExitHandle } from "../../../types/ExitHandle.js";
import { getEnterStack } from "./stack.js";

/**
 * Pushes an enter call onto the stack.
 *
 * @param handle - The exit handle to track
 * @internal
 */
export function pushEnter(handle: ExitHandle): void {
  getEnterStack().push(handle);
}
