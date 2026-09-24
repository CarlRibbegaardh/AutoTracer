import type { ExitHandle } from "./types/ExitHandle.js";
import type { StyledExitHandle } from "./types/StyledExitHandle.js";
import type { LogLevel } from "./types/LogLevel.js";
import type { GroupMode } from "./types/GroupMode.js";
import type { Theme } from "./types/Theme.js";
import { themes } from "./themes.js";
import { safeConsole } from "./functions/safe/safeConsole.js";
import { safeGroup } from "./functions/safe/safeGroup.js";
import { safeGroupEnd } from "./functions/safe/safeGroupEnd.js";
import { formatWithColor } from "./functions/helpers/formatMessage/index.js";
import { calculateElapsedMessage } from "./functions/helpers/timing/calculateElapsedMessage.js";
import { warnIfSlow } from "./functions/helpers/timing/warnIfSlow.js";
import { outputExitMessage } from "./functions/helpers/formatting/outputExitMessage.js";
import { calculateGroupIndent } from "./functions/helpers/formatting/calculateGroupIndent.js";
import { buildEnterMessageWithPrefix } from "./functions/helpers/formatting/buildEnterMessageWithPrefix.js";
import { buildExitMessageWithPrefix } from "./functions/helpers/formatting/buildExitMessageWithPrefix.js";
import { buildStructuredLoggerMessage } from "./functions/helpers/formatting/buildStructuredLoggerMessage.js";
import { unwindEnterStack } from "./functions/tracking/unwindEnterStack.js";

/**
 * Log level hierarchy ordered from least to most verbose.
 */
const LOG_LEVEL_HIERARCHY: readonly LogLevel[] = [
  "off",
  "fatal",
  "error",
  "warn",
  "log",
  "info",
  "debug",
  "verbose",
  "trace",
] as const;

/**
 * Logger interface representing an independent logging instance.
 * Each logger maintains its own log level, theme, name visibility,
 * group nesting stack, and enter/exit stack via closures.
 */
export interface Logger {
  /**
   * Sets the log level for this logger.
   * Only messages at or below this level will be output.
   * @param level - New log level
   */
  setLogLevel(level: LogLevel): void;

  /**
   * Sets the theme for this logger.
   * Controls visual styling including colors and prefixes.
   * @param theme - New theme configuration
   */
  setTheme(theme: Theme): void;

  /**
   * Sets the grouping mode for this logger.
   *
   * @param mode - New grouping mode
   */
  setGroupMode(mode: GroupMode): void;

  /**
   * Controls whether the logger name is prepended to all output.
   * @param show - true to show logger name, false to hide it
   */
  setShowName(show: boolean): void;

  /** Logs a fatal error message */
  fatal(message?: unknown, ...optionalParams: unknown[]): void;

  /** Logs an error message */
  error(message?: unknown, ...optionalParams: unknown[]): void;

  /** Logs a warning message */
  warn(message?: unknown, ...optionalParams: unknown[]): void;

  /** Logs a standard message */
  log(message?: unknown, ...optionalParams: unknown[]): void;

  /** Logs an informational message */
  info(message?: unknown, ...optionalParams: unknown[]): void;

  /** Logs a debug message */
  debug(message?: unknown, ...optionalParams: unknown[]): void;

  /** Logs a verbose message */
  verbose(message?: unknown, ...optionalParams: unknown[]): void;

  /** Logs a trace message */
  trace(message?: unknown, ...optionalParams: unknown[]): void;

  /** Creates a collapsible group */
  group(label?: string): void;

  /** Ends the current group */
  groupEnd(): void;

  /** Enters a timed code block */
  enter(label: string, ...optionalParams: unknown[]): ExitHandle;

  /** Exits a timed code block */
  exit(handle: ExitHandle, ...optionalParams: unknown[]): void;

  /**
   * Enters a timed code block with pre-styled label.
   * Use when you need full control over styling and want to preserve the raw label for re-styling on exit.
   *
   * @param rawLabel - Original unthemed label (e.g., "myFunction")
   * @param styledLabel - Pre-styled label to display (e.g., "%c→ myFunction")
   * @param optionalParams - Console formatting parameters (e.g., CSS strings)
   * @returns Handle with both raw and styled labels for use with exitStyled()
   *
   * @example
   * ```typescript
   * const handle = logger.enterStyled("myFunction", "%c→ myFunction", "color: blue");
   * // handle.rawLabel = "myFunction"
   * // handle.label = "%c→ myFunction"
   * logger.exitStyled(handle, "%c← myFunction", "color: green");
   * ```
   */
  enterStyled(
    rawLabel: string,
    styledLabel: string,
    ...optionalParams: unknown[]
  ): StyledExitHandle;

  /**
   * Exits a timed code block with custom styled label.
   * Use with handles from enterStyled() to apply different styling on exit.
   *
   * @param handle - Handle from enterStyled()
   * @param styledLabel - Pre-styled exit label (e.g., "%c← myFunction")
   * @param optionalParams - Console formatting parameters (overrides handle params if provided)
   *
   * @example
   * ```typescript
   * const handle = logger.enterStyled("myFunction", "%c→ myFunction", "color: blue");
   * logger.exitStyled(handle, "%c← myFunction", "color: green");
   * ```
   */
  exitStyled(
    handle: StyledExitHandle,
    styledLabel: string,
    ...optionalParams: unknown[]
  ): void;
}

/**
 * Checks if a message at the given level should be logged.
 * Pure function with no side effects.
 *
 * @param messageLevel - Level to check
 * @param currentLevel - Current logger level
 * @returns True if message should be output
 */
function shouldLog(messageLevel: LogLevel, currentLevel: LogLevel): boolean {
  const currentIndex = LOG_LEVEL_HIERARCHY.indexOf(currentLevel);
  const messageIndex = LOG_LEVEL_HIERARCHY.indexOf(messageLevel);
  return messageIndex <= currentIndex;
}

/**
 * Applies theme styling and outputs via console.
 * Orchestrates formatting and safe console output.
 * Applies indentation in text mode based on group depth.
 *
 * @param level - Log level
 * @param theme - Current theme
 * @param groupMode - Current grouping mode
 * @param depth - Current group nesting depth
 * @param message - Message to output
 * @param optionalParams - Additional parameters
 */
function outputWithTheme(
  level: LogLevel,
  theme: Theme,
  groupMode: GroupMode,
  depth: number,
  message: unknown,
  name: string,
  showName: boolean,
  ...optionalParams: unknown[]
): void {
  const prefix = theme.prefixes[level] || "";
  const color = theme.colors[level];

  const indent = groupMode === "text" ? calculateGroupIndent(depth) : "";

  const structuralMessage = buildStructuredLoggerMessage({
    indent,
    name,
    showName,
    prefix,
    message,
  });

  if (!color) {
    safeConsole(level, structuralMessage, ...optionalParams);
    return;
  }

  const [formatted, style] = formatWithColor(color, structuralMessage);
  safeConsole(level, formatted, style, ...optionalParams);
}
/**
 * Prepends logger name to message if enabled.
 * Pure function with no side effects.
 *
 * @param message - Original message
 * @param name - Logger name
 * @param show - Whether to show name
 * @returns Message with name prefix if enabled
 */
function applyName(message: unknown, name: string, show: boolean): unknown {
  if (!show) return message;
  return `[${name}] ${message}`;
}

/**
 * Creates a new logger instance with enclosed state.
 * Uses closures to maintain private state without classes.
 *
 * @param name - Logger identifier
 * @returns Logger instance with independent configuration and state
 */
export function createLogger(name: string): Logger {
  // Enclosed state (private to this logger instance)
  let level: LogLevel = "log";
  let theme: Theme = themes.default;
  let groupMode: GroupMode = "default";
  let showName = true;
  let groupStack = 0;
  const enterStack: ExitHandle[] = [];

  /**
   * Tracks which handles actually produced a visual enter output.
   *
   * This is required because handles can be created while logging is disabled,
   * then later exited after logging is enabled. Only handles that incremented
   * groupStack should be allowed to decrement it.
   */
  const didLogEnter = new WeakSet<ExitHandle>();

  /**
   * Checks whether a handle produced a visual enter output.
   *
   * @param handle - Handle returned by enter()/enterStyled()
   * @returns True when the enter call emitted output and incremented groupStack
   */
  function wasEnteredVisually(handle: ExitHandle): boolean {
    return didLogEnter.has(handle);
  }

  /**
   * Removes all tracked handles from a given stack index onwards.
   *
   * @param startIndex - First index to remove (inclusive)
   */
  function deleteTrackedEntersFromIndex(startIndex: number): void {
    for (let i = startIndex; i < enterStack.length; i++) {
      const h = enterStack[i];
      if (h) {
        didLogEnter.delete(h);
      }
    }
  }

  // Helper: logs if level permits
  const logAtLevel = (
    messageLevel: LogLevel,
    message?: unknown,
    ...optionalParams: unknown[]
  ): void => {
    if (shouldLog(messageLevel, level)) {
      outputWithTheme(
        messageLevel,
        theme,
        groupMode,
        groupStack,
        message,
        name,
        showName,
        ...optionalParams
      );
    }
  };

  return {
    setLogLevel(newLevel: LogLevel): void {
      level = newLevel;
    },

    setTheme(newTheme: Theme): void {
      theme = newTheme;
    },

    setGroupMode(mode: GroupMode): void {
      groupMode = mode;
    },

    setShowName(show: boolean): void {
      showName = show;
    },

    fatal(message?: unknown, ...optionalParams: unknown[]): void {
      logAtLevel("fatal", message, ...optionalParams);
    },

    error(message?: unknown, ...optionalParams: unknown[]): void {
      logAtLevel("error", message, ...optionalParams);
    },

    warn(message?: unknown, ...optionalParams: unknown[]): void {
      logAtLevel("warn", message, ...optionalParams);
    },

    log(message?: unknown, ...optionalParams: unknown[]): void {
      logAtLevel("log", message, ...optionalParams);
    },

    info(message?: unknown, ...optionalParams: unknown[]): void {
      logAtLevel("info", message, ...optionalParams);
    },

    debug(message?: unknown, ...optionalParams: unknown[]): void {
      logAtLevel("debug", message, ...optionalParams);
    },

    verbose(message?: unknown, ...optionalParams: unknown[]): void {
      logAtLevel("verbose", message, ...optionalParams);
    },

    trace(message?: unknown, ...optionalParams: unknown[]): void {
      logAtLevel("trace", message, ...optionalParams);
    },

    group(label?: string): void {
      if (shouldLog("log", level)) {
        const labelWithName = applyName(label, name, showName);
        if (groupMode === "default") {
          safeGroup(
            typeof labelWithName === "string" || labelWithName === undefined
              ? labelWithName
              : String(labelWithName)
          );
        } else {
          // Text mode grouping uses prefix
          const indent = calculateGroupIndent(groupStack);
          const prefix = `${indent}├─`;
          safeConsole("log", `${prefix} ${labelWithName}`);
        }
        groupStack++;
      }
    },

    groupEnd(): void {
      if (shouldLog("log", level) && groupStack > 0) {
        groupStack--;
        if (groupMode === "default") {
          safeGroupEnd();
        }
        // Text mode has no explicit end marker
      }
    },

    enter(label: string, ...optionalParams: unknown[]): ExitHandle {
      const entryLevel: LogLevel = "trace";
      const handle: ExitHandle = {
        label,
        startTime: performance.now(),
        level: entryLevel,
        optionalParams: optionalParams.length > 0 ? optionalParams : undefined,
      };

      if (shouldLog(entryLevel, level)) {
        const enterPrefix = theme.prefixes.enter || "";
        const messageWithPrefix = buildEnterMessageWithPrefix(
          label,
          enterPrefix
        );
        const messageWithName = applyName(messageWithPrefix, name, showName);

        if (groupMode === "default") {
          safeGroup(
            typeof messageWithName === "string" || messageWithName === undefined
              ? messageWithName
              : String(messageWithName),
            ...optionalParams
          );
        } else {
          const indent = calculateGroupIndent(groupStack);
          const textPrefix = `${indent}├─`;
          safeConsole(
            entryLevel,
            `${textPrefix} ${messageWithName}`,
            ...optionalParams
          );
        }
        didLogEnter.add(handle);
        groupStack++;
      }

      enterStack.push(handle);
      return handle;
    },

    exit(handle: ExitHandle, ...optionalParams: unknown[]): void {
      const finalParams =
        optionalParams.length > 0
          ? optionalParams
          : handle.optionalParams || [];
      const index = enterStack.indexOf(handle);

      const unwindResult = unwindEnterStack(
        enterStack,
        index,
        groupStack,
        (h: ExitHandle, currentGroupStack: number) => {
          if (!wasEnteredVisually(h)) {
            didLogEnter.delete(h);
            return currentGroupStack;
          }
          const elapsed = performance.now() - h.startTime;
          const elapsedMsg = calculateElapsedMessage(h.label, elapsed);
          const msg = buildExitMessageWithPrefix(
            elapsedMsg,
            theme.prefixes.exit || ""
          );
          const msgWithName = applyName(msg, name, showName);

          warnIfSlow(elapsed, h.label);

          const newGroupStack = outputExitMessage(
            typeof msgWithName === "string" ? msgWithName : String(msgWithName),
            h.level,
            currentGroupStack,
            groupMode,
            ...finalParams
          );
          didLogEnter.delete(h);
          return newGroupStack;
        },
        (lvl: LogLevel) => {
          return shouldLog(lvl, level);
        }
      );

      if (unwindResult.shouldReturn) {
        return;
      }

      if (!unwindResult.isNormalExit) {
        // Unwinding path: update state and truncate stack
        deleteTrackedEntersFromIndex(unwindResult.newEnterStackLength);
        groupStack = unwindResult.newGroupStack;
        enterStack.length = unwindResult.newEnterStackLength;
      } else {
        // Normal exit path: pop and process
        enterStack.pop();
        if (wasEnteredVisually(handle) && shouldLog(handle.level, level)) {
          const elapsed = performance.now() - handle.startTime;
          const elapsedMsg = calculateElapsedMessage(handle.label, elapsed);
          const msg = buildExitMessageWithPrefix(
            elapsedMsg,
            theme.prefixes.exit || ""
          );
          const msgWithName = applyName(msg, name, showName);

          warnIfSlow(elapsed, handle.label);

          groupStack = outputExitMessage(
            typeof msgWithName === "string" ? msgWithName : String(msgWithName),
            handle.level,
            groupStack,
            groupMode,
            ...finalParams
          );
        }
        didLogEnter.delete(handle);
      }
    },

    enterStyled(
      rawLabel: string,
      styledLabel: string,
      ...optionalParams: unknown[]
    ): StyledExitHandle {
      const entryLevel: LogLevel = "trace";
      const handle: StyledExitHandle = {
        label: styledLabel,
        rawLabel,
        startTime: performance.now(),
        level: entryLevel,
        optionalParams: optionalParams.length > 0 ? optionalParams : undefined,
      };

      if (shouldLog(entryLevel, level)) {
        const enterPrefix = theme.prefixes.enter || "";
        const messageWithPrefix = buildEnterMessageWithPrefix(
          styledLabel,
          enterPrefix
        );
        const messageWithName = applyName(messageWithPrefix, name, showName);

        if (groupMode === "default") {
          safeGroup(
            typeof messageWithName === "string" || messageWithName === undefined
              ? messageWithName
              : String(messageWithName),
            ...optionalParams
          );
        } else {
          const indent = calculateGroupIndent(groupStack);
          const textPrefix = `${indent}├─`;
          safeConsole(
            entryLevel,
            `${textPrefix} ${messageWithName}`,
            ...optionalParams
          );
        }
        didLogEnter.add(handle);
        groupStack++;
      }

      enterStack.push(handle);
      return handle;
    },

    exitStyled(
      handle: StyledExitHandle,
      styledLabel: string,
      ...optionalParams: unknown[]
    ): void {
      const finalParams =
        optionalParams.length > 0
          ? optionalParams
          : handle.optionalParams || [];
      const index = enterStack.indexOf(handle);

      const unwindResult = unwindEnterStack(
        enterStack,
        index,
        groupStack,
        (h: ExitHandle, currentGroupStack: number) => {
          if (!wasEnteredVisually(h)) {
            didLogEnter.delete(h);
            return currentGroupStack;
          }
          const elapsed = performance.now() - h.startTime;
          const elapsedMsg = calculateElapsedMessage(h.label, elapsed);
          const msg = buildExitMessageWithPrefix(
            elapsedMsg,
            theme.prefixes.exit || ""
          );
          const msgWithName = applyName(msg, name, showName);

          warnIfSlow(elapsed, h.label);

          const newGroupStack = outputExitMessage(
            typeof msgWithName === "string" ? msgWithName : String(msgWithName),
            h.level,
            currentGroupStack,
            groupMode,
            ...finalParams
          );
          didLogEnter.delete(h);
          return newGroupStack;
        },
        (lvl: LogLevel) => {
          return shouldLog(lvl, level);
        }
      );

      if (unwindResult.shouldReturn) {
        return;
      }

      if (!unwindResult.isNormalExit) {
        // Unwinding path: update state and truncate stack
        deleteTrackedEntersFromIndex(unwindResult.newEnterStackLength);
        groupStack = unwindResult.newGroupStack;
        enterStack.length = unwindResult.newEnterStackLength;
      } else {
        // Normal exit path: pop and process
        enterStack.pop();
        if (wasEnteredVisually(handle) && shouldLog(handle.level, level)) {
          const elapsed = performance.now() - handle.startTime;
          const elapsedMsg = calculateElapsedMessage(styledLabel, elapsed);
          const msgWithName = applyName(elapsedMsg, name, showName);

          warnIfSlow(elapsed, handle.rawLabel);

          groupStack = outputExitMessage(
            typeof msgWithName === "string" ? msgWithName : String(msgWithName),
            handle.level,
            groupStack,
            groupMode,
            ...finalParams
          );
        }
        didLogEnter.delete(handle);
      }
    },
  };
}
