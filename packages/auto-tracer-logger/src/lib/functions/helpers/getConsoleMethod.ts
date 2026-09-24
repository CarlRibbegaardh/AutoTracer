import type { LogLevel } from "../../types/LogLevel.js";

/**
 * Maps log level to the corresponding console method.
 *
 * @param level - The log level
 * @returns The appropriate console method
 */
export function getConsoleMethod(
  level: LogLevel
): (...args: unknown[]) => void {
  switch (level) {
    case "off":
      return () => {}; // No-op function for 'off' level
    case "fatal":
    case "error":
      return console.error.bind(console);
    case "warn":
      return console.warn.bind(console);
    case "info":
      return console.info.bind(console);
    case "debug": // return console.debug.bind(console); // DO NOT BIND TO console.debug. It changes the output format.
    case "log":
    case "verbose":
    case "trace":
      return console.log.bind(console);
  }
}
