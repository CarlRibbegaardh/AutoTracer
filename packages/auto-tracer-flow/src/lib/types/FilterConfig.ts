/**
 * Filter configuration for include/exclude patterns.
 * Supports glob patterns, regex, and exact strings for maximum flexibility.
 */
export interface FilterConfig {
  /**
   * Function name patterns (supports glob, regex, or exact strings).
   *
   * @example
   * // Glob patterns (using micromatch)
   * functions: ['handleClick', 'fetch*', 'process**']
   *
   * @example
   * // Regex patterns
   * functions: [/^handle[A-Z]/, /.*Async$/]
   *
   * @example
   * // Exact strings
   * functions: ['handleSubmit', 'validateInput']
   */
  functions?: Array<string | RegExp>;

  /**
   * File path patterns (supports glob patterns).
   * Matched against the absolute or relative file path where the function is defined.
   *
   * @example
   * // Include only specific directories
   * paths: ['src/components/**', 'src/services/**']
   *
   * @example
   * // Exclude test files
   * paths: ['!**\/*.test.ts', '!**\/node_modules\/**']
   */
  paths?: string[];

  /**
   * Class/namespace name patterns (for TypeScript/OOP code).
   * Matches the containing class or namespace of a method.
   *
   * @example
   * // Only trace methods in these classes
   * classes: ['UserService', 'Auth*', /^.*Controller$/]
   */
  classes?: Array<string | RegExp>;

  /**
   * Module name patterns (for ES6 modules).
   * Matches the module path or exported name.
   *
   * @example
   * // Only trace specific modules
   * modules: ['utils/auth', 'api/*']
   */
  modules?: string[];
}
