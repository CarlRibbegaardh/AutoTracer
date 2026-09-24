import type { LogLevel } from "../../types/LogLevel.js";
import type { ExitHandle } from "../../types/ExitHandle.js";
import { group } from "../grouping/group.js";
import { shouldLog } from "../helpers/shouldLog.js";
import { getThemeInternal } from "../state/theme.js";
import { safeConsole } from "../safe/safeConsole.js";
import { pushEnter } from "../state/enterStack/index.js";
import {
  formatWithColor,
  formatWithColorAndPrefix,
  formatWithPrefix,
} from "../helpers/formatMessage/index.js";

/**
 * Enters a performance tracking section.
 * Creates a group, records timing, and returns a handle for exit().
 * Applies theme styling (enter prefix and trace level color) to the enter message.
 * Always uses 'trace' log level.
 *
 * @param label - The label for this section
 * @param optionalParams - Additional parameters for console output (e.g., CSS styling)
 * @returns Exit handle containing timing and context
 */
export function enter(label: string, ...optionalParams: unknown[]): ExitHandle {
  const level: LogLevel = "trace";

  const handle: ExitHandle = {
    label,
    startTime: performance.now(),
    level,
    optionalParams,
  };

  if (shouldLog(level)) {
    group(label);

    // Apply theme styling to enter message
    const theme = getThemeInternal();
    const enterPrefix = theme.prefixes.enter || "";
    const color = theme.colors[level];

    if (color && enterPrefix) {
      const [formattedMessage, style] = formatWithColorAndPrefix(
        enterPrefix,
        color,
        label
      );
      safeConsole(level, formattedMessage, style, ...optionalParams);
    } else if (color) {
      const [formattedMessage, style] = formatWithColor(color, label);
      safeConsole(level, formattedMessage, style, ...optionalParams);
    } else if (enterPrefix) {
      const formattedMessage = formatWithPrefix(enterPrefix, label);
      safeConsole(level, formattedMessage, ...optionalParams);
    } else {
      safeConsole(level, label, ...optionalParams);
    }
  }

  pushEnter(handle);
  return handle;
}
