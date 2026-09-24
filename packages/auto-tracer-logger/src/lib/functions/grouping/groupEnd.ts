import { safeGroupEnd } from "../safe/safeGroupEnd.js";
import { shouldLog } from "../helpers/shouldLog.js";
import { decrementDepth } from "../state/groupDepth.js";
import { getGroupMode } from "../state/getGroupMode.js";

/**
 * Ends the current group.
 * Behavior depends on current groupMode:
 * - 'default': Uses console.groupEnd
 * - 'text': Decrements indentation depth
 * Only executes if current log level is 'log' or higher.
 */
export function groupEnd(): void {
  if (!shouldLog("log")) {
    return;
  }

  const groupMode = getGroupMode();

  if (groupMode === "text") {
    decrementDepth();
  } else {
    safeGroupEnd();
  }
}
