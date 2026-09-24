import type { ExitHandle } from "../../types/ExitHandle.js";
import { groupEnd } from "../grouping/groupEnd.js";
import { shouldLog } from "../helpers/shouldLog.js";
import { getThemeInternal } from "../state/theme.js";
import { safeConsole } from "../safe/safeConsole.js";
import {
  findHandleIndex,
  getHandlesToUnwind,
  peekStack,
  truncateStack,
} from "../state/enterStack/index.js";
import {
  formatWithColor,
  formatWithColorAndPrefix,
  formatWithPrefix,
} from "../helpers/formatMessage/index.js";
import { calculateElapsedMessage } from "../helpers/timing/calculateElapsedMessage.js";
import { warnIfSlow } from "../helpers/timing/warnIfSlow.js";

/**
 * Outputs an exit message with theme styling.
 * Applies exit prefix and level color from current theme.
 *
 * @param handle - The exit handle containing label, timing, and level
 */
function outputExitMessage(handle: ExitHandle): void {
  const elapsed = performance.now() - handle.startTime;
  const message = calculateElapsedMessage(handle.label, elapsed);

  warnIfSlow(elapsed, handle.label);

  // If optionalParams were stored from enter(), use them for the exit message
  if (handle.optionalParams && handle.optionalParams.length > 0) {
    safeConsole(handle.level, message, ...handle.optionalParams);
    return;
  }

  // Otherwise, apply theme styling as before
  const theme = getThemeInternal();
  const exitPrefix = theme.prefixes.exit || "";
  const color = theme.colors[handle.level];

  if (color && exitPrefix) {
    const [formattedMessage, style] = formatWithColorAndPrefix(
      exitPrefix,
      color,
      message
    );
    safeConsole(handle.level, formattedMessage, style);
  } else if (color) {
    const [formattedMessage, style] = formatWithColor(color, message);
    safeConsole(handle.level, formattedMessage, style);
  } else if (exitPrefix) {
    const formattedMessage = formatWithPrefix(exitPrefix, message);
    safeConsole(handle.level, formattedMessage);
  } else {
    safeConsole(handle.level, message);
  }
}

/**
 * Exits a performance tracking section.
 * Logs elapsed time and closes the group.
 * Handles stack unwinding on mismatch.
 *
 * @param handle - The exit handle returned from enter()
 */
export function exit(handle: ExitHandle): void {
  const index = findHandleIndex(handle);

  // Handle not found in stack
  if (index === -1) {
    console.warn(
      `Tried to exit previously entered item "${handle.label}", but it's not in the stack.`
    );
    return;
  }

  const topHandle = peekStack();

  // Mismatch: handle is not at top of stack - unwind
  if (index < (topHandle ? findHandleIndex(topHandle) : -1)) {
    console.warn(
      `Expected to exit previously entered item "${
        topHandle!.label
      }", but the code asked to exit item "${
        handle.label
      }". There is probably a missing logger.exit(h) before a return statement, OR an exception was thrown. Unwinding stack...`
    );

    // Get all handles to unwind (top down to requested handle, inclusive)
    const handlesToUnwind = getHandlesToUnwind(index);

    // Output exit message for each unwound handle
    for (const h of handlesToUnwind) {
      if (shouldLog(h.level)) {
        outputExitMessage(h);
        groupEnd();
      }
    }

    // Truncate stack
    truncateStack(index);
    return;
  }

  // Normal exit: handle is at top of stack
  if (shouldLog(handle.level)) {
    outputExitMessage(handle);
    groupEnd();
  }

  truncateStack(index);
}
