/**
 * Theme configuration for visual styling of log output.
 * Controls colors and prefixes for all log messages.
 */
export interface Theme {
  /** HTML color values for each log level */
  colors: {
    /** Color for off level messages (never displayed) */
    off?: string;
    /** Color for fatal level messages */
    fatal?: string;
    /** Color for error level messages */
    error?: string;
    /** Color for warn level messages */
    warn?: string;
    /** Color for log level messages */
    log?: string;
    /** Color for info level messages */
    info?: string;
    /** Color for debug level messages */
    debug?: string;
    /** Color for verbose level messages */
    verbose?: string;
    /** Color for trace level messages */
    trace?: string;
  };

  /** UTF-8 icons or text prefixes for each log level and enter/exit markers */
  prefixes: {
    /** Prefix for off level messages (never displayed) */
    off?: string;
    /** Prefix for fatal level messages */
    fatal?: string;
    /** Prefix for error level messages */
    error?: string;
    /** Prefix for warn level messages */
    warn?: string;
    /** Prefix for log level messages */
    log?: string;
    /** Prefix for info level messages */
    info?: string;
    /** Prefix for debug level messages */
    debug?: string;
    /** Prefix for verbose level messages */
    verbose?: string;
    /** Prefix for trace level messages */
    trace?: string;
    /** Prefix for enter() marker */
    enter?: string;
    /** Prefix for exit() marker */
    exit?: string;
  };
}
