import type { LogLevel } from "../../types/LogLevel.js";
import { getThemeInternal } from "../state/theme.js";
import { safeConsole } from "../safe/safeConsole.js";
import { getTextModeIndent } from "./formatting/getTextModeIndent.js";
import { buildStructuredLoggerMessage } from "./formatting/buildStructuredLoggerMessage.js";
import { formatWithColor } from "./formatMessage/index.js";

/**
 * Applies theme styling (color and prefix) to a log message and outputs via safeConsole.
 * Orchestrates theme lookup, message formatting, and console output.
 *
 * @param level - The log level to style (determines color and prefix from theme)
 * @param message - The primary message to log
 * @param optionalParams - Additional parameters to log
 */
export function applyTheme(
  level: LogLevel,
  message?: unknown,
  ...optionalParams: unknown[]
): void {
  const theme = getThemeInternal();
  const prefix = theme.prefixes[level] || "";
  const color = theme.colors[level];

  const indent = getTextModeIndent();

  const structuralMessage = buildStructuredLoggerMessage({
    indent,
    name: "",
    showName: false,
    prefix,
    message: message === undefined ? "" : message,
  });

  if (!color) {
    safeConsole(level, structuralMessage, ...optionalParams);
    return;
  }

  const [formattedMessage, style] = formatWithColor(color, structuralMessage);
  safeConsole(level, formattedMessage, style, ...optionalParams);
}
