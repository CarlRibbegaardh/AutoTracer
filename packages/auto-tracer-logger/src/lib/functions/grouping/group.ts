import { safeGroup } from "../safe/safeGroup.js";
import { safeLog } from "../safe/safeLog.js";
import { shouldLog } from "../helpers/shouldLog.js";
import { getDepth, incrementDepth } from "../state/groupDepth.js";
import { getGroupMode } from "../state/getGroupMode.js";

/**
 * Creates a new group for hierarchical log organization.
 * Behavior depends on current groupMode:
 * - 'default': Uses console.group
 * - 'text': Uses UTF-8 box-drawing characters
 * Only outputs if current log level is 'log' or higher.
 *
 * @param label - The label for the group
 */
export function group(label?: string): void {
  if (!shouldLog("log")) {
    return;
  }

  const groupMode = getGroupMode();

  if (groupMode === "text") {
    const depth = getDepth();
    const indent = "│  ".repeat(depth);
    const prefix = "├─";
    safeLog(`${indent}${prefix} ${label ?? ""}`);
    incrementDepth();
  } else {
    safeGroup(label);
  }
}
