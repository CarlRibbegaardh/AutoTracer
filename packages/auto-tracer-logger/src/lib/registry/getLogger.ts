import { type Logger, createLogger } from "../Logger.js";

/**
 * Registry storing all created logger instances.
 * Maps logger names to their singleton instances.
 */
const loggers = new Map<string, Logger>();

/**
 * Gets or creates a logger instance for the given name.
 * If a logger with this name already exists, returns the existing instance.
 * Otherwise, creates a new logger with default configuration.
 *
 * @param name - Logger identifier (case-sensitive)
 * @returns Logger instance for the given name
 *
 * @example
 * ```typescript
 * const logger = getLogger('app');
 * logger.setLogLevel('debug');
 * logger.log('Hello');
 *
 * // Same instance
 * const sameLogger = getLogger('app');
 * console.log(logger === sameLogger); // true
 * ```
 */
export function getLogger(name: string): Logger {
  if (!loggers.has(name)) {
    loggers.set(name, createLogger(name));
  }
  return loggers.get(name)!;
}
