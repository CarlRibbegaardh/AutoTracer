/**
 * Log level type representing the verbosity hierarchy.
 * Levels are ordered from least verbose (off) to most verbose (trace).
 */
export type LogLevel =
  | "off"
  | "fatal"
  | "error"
  | "warn"
  | "log"
  | "info"
  | "debug"
  | "verbose"
  | "trace";
