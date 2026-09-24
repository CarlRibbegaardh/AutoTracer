import type { ExitHandle } from "../../types/ExitHandle.js";
import type { LogLevel } from "../../types/LogLevel.js";

/**
 * Result of the unwindEnterStack operation.
 */
export interface UnwindResult {
  /**
   * The updated groupStack value after unwinding.
   */
  newGroupStack: number;
  /**
   * The new length the enterStack should be truncated to.
   */
  newEnterStackLength: number;
  /**
   * Whether the caller should return early.
   */
  shouldReturn: boolean;
  /**
   * Whether this is a normal exit path (no unwinding needed).
   */
  isNormalExit: boolean;
}

/**
 * Handles stack unwinding logic when an exit handle is not at the top of the stack.
 *
 * This function implements the mismatch resolution logic where handles are closed
 * in reverse order from the top of the stack down to and including the target handle.
 *
 * @param enterStack - The current enter stack
 * @param targetIndex - The index of the handle to exit
 * @param currentGroupStack - The current groupStack value
 * @param outputFn - Function to call for each handle being unwound, returns new groupStack
 * @param shouldLogFn - Function to determine if a handle should be logged
 * @returns UnwindResult containing new stack values and control flow flags
 */
export function unwindEnterStack(
  enterStack: ExitHandle[],
  targetIndex: number,
  currentGroupStack: number,
  outputFn: (handle: ExitHandle, groupStack: number) => number,
  shouldLogFn: (level: LogLevel) => boolean
): UnwindResult {
  // Handle not found in stack
  if (targetIndex === -1) {
    console.warn('Cannot exit "unknown" - handle not found in stack');
    return {
      newGroupStack: currentGroupStack,
      newEnterStackLength: enterStack.length,
      shouldReturn: true,
      isNormalExit: false,
    };
  }

  // Normal exit path (handle is at top of stack)
  if (targetIndex === enterStack.length - 1) {
    return {
      newGroupStack: currentGroupStack,
      newEnterStackLength: enterStack.length,
      shouldReturn: false,
      isNormalExit: true,
    };
  }

  // Mismatch: unwind stack
  const expected = enterStack[enterStack.length - 1];
  const target = enterStack[targetIndex];

  if (!target) {
    const message =
      enterStack.length === 0
        ? "Cannot exit - stack is empty"
        : `Cannot exit - handle not found at index ${targetIndex}`;
    console.warn(message);
    return {
      newGroupStack: currentGroupStack,
      newEnterStackLength: enterStack.length,
      shouldReturn: true,
      isNormalExit: false,
    };
  }

  console.warn(
    `Expected to exit "${expected?.label ?? "unknown"}", but got "${
      target.label
    }". Unwinding stack...`
  );

  let groupStack = currentGroupStack;

  // Close all from top down to and including the requested handle
  for (let i = enterStack.length - 1; i >= targetIndex; i--) {
    const h = enterStack[i];
    if (!h) {
      continue;
    }
    if (shouldLogFn(h.level)) {
      groupStack = outputFn(h, groupStack);
    }
  }

  return {
    newGroupStack: groupStack,
    newEnterStackLength: targetIndex,
    shouldReturn: false,
    isNormalExit: false,
  };
}
