import { safeConsole } from "../../safe/safeConsole.js";
import { safeGroupEnd } from "../../safe/safeGroupEnd.js";
import type { LogLevel } from "../../../types/LogLevel.js";
import type { GroupMode } from "../../../types/GroupMode.js";
import { calculateExitIndent } from "./calculateExitIndent.js";

/**
 * Outputs an exit message with appropriate formatting based on theme mode.
 *
 * In default mode, outputs the message and calls groupEnd.
 * In text mode, outputs the message with a └─ prefix and indentation.
 *
 * @param message - The message to output
 * @param level - The log level to use
 * @param groupStack - The current group stack depth
 * @param groupMode - The grouping mode
 * @param optionalParams - Additional parameters to pass to console
 * @returns The new groupStack value after decrementing
 */
export function outputExitMessage(
  message: string,
  level: LogLevel,
  groupStack: number,
  groupMode: GroupMode,
  ...optionalParams: unknown[]
): number {
  if (groupMode === "default") {
    safeConsole(level, message, ...optionalParams);
    safeGroupEnd();
  } else {
    const indent = calculateExitIndent(groupStack);
    const textPrefix = `${indent}└─`;
    safeConsole(level, `${textPrefix} ${message}`, ...optionalParams);
  }
  return groupStack - 1;
}
