/**
 * Configuration for the Babel flow tracing plugin.
 * Controls AST transformation behavior and filtering.
 */
export interface BabelPluginFlowConfig {
  /**
   * Sets the canonical AutoTracer output mode at startup.
   *
   * When provided, this is injected into modules that import `@autotracer/flow/runtime`
   * so you don't need to manually call `globalThis.autoTracer.setOutputMode(...)`.
   *
   * @default undefined (not set - respects any pre-existing outputMode)
   *
   * @example
   * outputMode: 'devtools' // Interactive console groups
   *
   * @example
   * outputMode: 'copy-paste' // Text-based output with box-drawing characters
   */
  outputMode?: "devtools" | "copy-paste";

  /**
   * Include exception logging in catch blocks.
   * When true, wraps function body in try/catch/finally.
   * When false, wraps only in try/finally.
   * @default true
   */
  logExceptions?: boolean;

  /**
   * Log level for exception logging.
   * Uses debug by default since exceptions might be expected.
   * @default 'debug'
   */
  exceptionLogLevel?: "debug" | "warn" | "error";

  /**
   * Name of the global tracer instance variable.
   * @default '__flowTracer'
   */
  tracerName?: string;

  /**
   * Include patterns - only transform functions matching these patterns.
   *
   * @default All standard JS/TS source files (`**\/*.{js,jsx,mjs,ts,tsx,mts}`) with
   * all functions included.
   *
   * @example
   * include: {
   *   paths: ['src/**\/*.ts', 'lib/**\/*.ts'],
   *   functions: ['handle*', 'process*', /^fetch/]
   * }
   */
  include?: {
    /**
     * Function name patterns (glob, regex, or exact strings).
     *
     * @default [] (all functions included)
     *
     * @example
     * functions: ['handleClick', 'process*', /^fetch/]
     */
    functions?: Array<string | RegExp>;

    /**
     * File path patterns (glob patterns).
     *
     * @default ["**\/*.{js,jsx,mjs,ts,tsx,mts}"]
     *
     * @example
     * paths: ['src/**\/*.ts', 'lib/**\/*.ts']
     */
    paths?: string[];
  };

  /**
   * Exclude patterns - skip functions matching these patterns.
   * Takes precedence over include patterns.
   *
   * @default 10 noise-exclusion patterns mirroring the React18 plugin: test files
   * (*.test.* and *.spec.*), build outputs (dist, build, .next), and tooling
   * directories (node_modules, coverage, tests, test, __tests__).
   * No functions are excluded by default.
   *
   * @example
   * exclude: {
   *   paths: ['**\/*.test.ts', '**\/*.spec.ts', 'src/mocks/**'],
   *   functions: [/^_private/, 'deprecated*']
   * }
   */
  exclude?: {
    /**
     * Function name patterns (glob, regex, or exact strings).
     *
     * @default [] (no functions excluded)
     *
     * @example
     * functions: [/^_internal/, 'legacy*', 'deprecatedHandler']
     */
    functions?: Array<string | RegExp>;

    /**
     * File path patterns (glob patterns).
     *
     * @default 10-pattern noise-exclusion array (test files, build outputs,
     * node_modules, coverage, Next.js output). See `DEFAULT_CONFIG.exclude.paths`
     * for the full list.
     *
     * @example
     * paths: ['**\/*.test.ts', '**\/*.spec.ts', 'src/mocks/**']
     */
    paths?: string[];
  };
  /**
   * Instrumentation mode: whether functions are instrumented by default.
   *
   * - `"opt-out"` (default): all eligible functions are instrumented unless `@trace-disable` is present.
   * - `"opt-in"`: only functions explicitly marked with `@trace` are instrumented.
   *
   * @default 'opt-out'
   */
  mode?: "opt-in" | "opt-out";

  /**
   * Optional prefix prepended to every instrumented function name, separated by
   * a colon (e.g. `"Header"` → `"Header:processData"`).
   *
   * For nested functions the prefix becomes the outermost segment, so a nested
   * function `outer → inner` becomes `"Header:outer:inner"`.
   *
   * Use this when multiple independent entry-points (micro-frontends, React
   * islands) share a browser tab and you need to distinguish their call stacks.
   *
   * An empty string or `undefined` disables prefixing.
   */
  prefix?: string;
}

/**
 * Fully-normalized Babel plugin configuration.
 *
 * All configuration fields are required after normalization except `outputMode`
 * and `prefix`, which remain optional so the plugin never overrides a
 * pre-existing global outputMode and never adds a prefix unless explicitly
 * configured.
 */
export type NormalizedBabelPluginFlowConfig = Omit<
  Required<BabelPluginFlowConfig>,
  "outputMode" | "prefix"
> & {
  outputMode?: BabelPluginFlowConfig["outputMode"];
  prefix?: string;
  /** Resolved instrumentation mode after applying the default. */
  mode: "opt-in" | "opt-out";
};

/**
 * Default configuration.
 *
 * - `include.paths` — processes all JS/TS source file extensions by default.
 * - `exclude.paths` — mirrors the React18 plugin defaults: omits test files,
 *   build outputs, and other instrumentation noise.
 */
export const DEFAULT_CONFIG: NormalizedBabelPluginFlowConfig = {
  logExceptions: true,
  exceptionLogLevel: "debug",
  tracerName: "__flowTracer",
  include: { paths: ["**/*.{js,jsx,mjs,ts,tsx,mts}"], functions: [] },
  exclude: {
    paths: [
      "**/*.test.*",
      "**/*.spec.*",
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/coverage/**",
      "**/tests/**",
      "**/test/**",
      "**/__tests__/**",
    ],
    functions: [],
  },
  mode: "opt-out",
};
