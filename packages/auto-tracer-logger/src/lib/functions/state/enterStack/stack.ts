import type { ExitHandle } from "../../../types/ExitHandle.js";

/**
 * Stack of active enter calls for mismatch detection.
 * Internal module state - not exported directly.
 */
const enterStack: ExitHandle[] = [];

/**
 * Gets the internal enter stack.
 * Used by stack manipulation functions.
 *
 * @returns The enter stack array
 * @internal
 */
export function getEnterStack(): ExitHandle[] {
  return enterStack;
}
