import type { OutputMode } from "../autoTracer/OutputMode.js";

interface ThemeOptions {
  background?: string;
  text?: string;
  bold?: boolean;
  italic?: boolean;
}
interface ColorOptions {
  darkMode?: ThemeOptions;
  lightMode?: ThemeOptions;
  icon?: string;
}
interface SkippedObjectProp {
  objectName: string;
  propNames: string[];
}

/**
 * Controls visibility of non-tracked components in the tree.
 * Tracked components (those with useReactTracer) are ALWAYS visible regardless of these settings.
 *
 * @example
 * "never" - Never show non-tracked components of this type
 * "forProps" - Show only if component has initial props or prop changes
 * "forState" - Show only if component has initial state or state changes
 * "forPropsOrState" - Show if component has props OR state (most common for curious users)
 * "always" - Always show non-tracked components of this type (full debug mode)
 */
type NonTrackedComponentVisibility =
  | "never"
  | "forProps"
  | "forState"
  | "forPropsOrState"
  | "always";

/**
 * Configuration options for detecting and warning about identical value changes.
 * This helps identify performance anti-patterns where components re-render due to
 * new object/array/function references that contain identical values.
 */
// Removed advanced configuration in favor of a simple boolean per spec
// Detect identical value changes: when references differ but stringified values are equal
type DetectIdenticalValueChanges = boolean;

interface ReactTracerOptions {
  /**
   * Sets the canonical output mode during initialization.
   *
   * This makes output format configurable from startup without requiring
   * a manual runtime call to `globalThis.autoTracer.setOutputMode(...)`.
   *
   * When omitted, any output mode already seeded into
   * `globalThis.__autoTracerInternal` (e.g. by the Vite plugin) is preserved.
   * Only provide this option when you need to force a specific mode from code.
   *
   * @default undefined — inherits any pre-seeded global output mode ("devtools" is the underlying default)
   */
  outputMode?: OutputMode;

  /**
   * Enable or disable the entire reactTracer system.
   * When false, no tracing will occur and performance overhead is minimal.
   * Pass `true` when you want tracing to start immediately at bootstrap.
   * @default false
   */
  enabled?: boolean;

  /**
   * Control visibility of reconciled non-tracked components.
   * Reconciled components are those that React checked but didn't need to re-render.
   *
   * Tracked components are ALWAYS visible regardless of this setting.
   *
   * - "never": Hide all reconciled non-tracked components
   * - "forProps": Show only if has props changes
   * - "forState": Show only if has state changes
   * - "forPropsOrState": Show if has props OR state
   * - "always": Show all reconciled components
   *
   * @default "never"
   */
  includeReconciled?: NonTrackedComponentVisibility;

  /**
   * Control visibility of skipped non-tracked components.
   * Skipped components are those where React did internal work but didn't execute the component function.
   *
   * Tracked components are ALWAYS visible regardless of this setting.
   *
   * - "never": Hide all skipped non-tracked components
   * - "forProps": Show only if has props changes
   * - "forState": Show only if has state changes
   * - "forPropsOrState": Show if has props OR state
   * - "always": Show all skipped components
   *
   * @default "never"
   */
  includeSkipped?: NonTrackedComponentVisibility;

  /**
   * Control visibility of mount non-tracked components.
   * Mount components are those rendering for the first time.
   *
   * Tracked components are ALWAYS visible regardless of this setting.
   *
   * - "never": Hide all mount non-tracked components
   * - "forProps": Show only if has initial props
   * - "forState": Show only if has initial state
   * - "forPropsOrState": Show if has props OR state
   * - "always": Show all mount components
   *
   * @default "never"
   */
  includeMount?: NonTrackedComponentVisibility;

  /**
   * Control visibility of rendered (update phase) non-tracked components.
   * Rendered components are those re-rendering due to props/state changes.
   *
   * Tracked components are ALWAYS visible regardless of this setting.
   *
   * - "never": Hide all rendered non-tracked components
   * - "forProps": Show only if has props changes
   * - "forState": Show only if has state changes
   * - "forPropsOrState": Show if has props OR state
   * - "always": Show all rendered components
   *
   * @default "never"
   */
  includeRendered?: NonTrackedComponentVisibility;

  /**
   * Show React fiber flags in the output.
   * Flags indicate internal React operations like Placement, Update, etc.
   * Useful for deep debugging of React's reconciliation process.
   * @default false
   */
  showFlags?: boolean;

  /**
   * Log level for ReactTracer internal diagnostics.
   * Controls visibility of internal operations, performance metrics, and debugging details.
   *
   * **Log Levels** (from most to least verbose):
   *
   * - **"trace"**: All performance timing (enter/exit for every operation: tree building, filtering, rendering, hook resolution, fiber traversal)
   * - **"debug"**: Operation details (node counts, filtering decisions, hook mappings, state changes)
   * - **"info"**: Lifecycle events (initialization, shutdown, render cycle numbers)
   * - **"warn"**: Important notices (already active, DevTools unavailable, stack mismatches)
   * - **"error"**: Only failures (exceptions, errors, corrupted state)
   *
   * **Recommended Settings:**
   * - Production: `"error"` (default) - Silent unless something breaks
   * - Development: `"info"` or `"debug"` - See what ReactTracer is doing
   * - Debugging ReactTracer: `"trace"` - Full internal visibility with timing
   *
   * @default "error"
   */
  internalLogLevel?:
    | "fatal"
    | "error"
    | "warn"
    | "log"
    | "info"
    | "debug"
    | "verbose"
    | "trace";

  showLevelDetails?: boolean;

  /**
   * Filter mode for collapsing empty nodes in the component tree.
   *
   * Empty nodes are components that render without meaningful content:
   * - No state changes
   * - No prop changes
   * - No component logs
   * - Not tracked (no trackingGUID)
   * - No identical value warnings
   * - Visibility-filtered nodes (Reconciled when includeReconciled=false, Skipped when includeSkipped=false)
   *
   * Filter modes:
   *
   * **"none"** (default):
   * - No filtering applied
   * - All nodes appear in the tree regardless of content
   * - Zero performance overhead (identity function)
   * - Use when you need complete visibility into the component hierarchy
   *
   * **"first"**:
   * - Collapses only the initial sequence of empty nodes at the start of the tree
   * - Replaces consecutive empty nodes with a single marker: "... (N empty levels)"
   * - Preserves all empty nodes that appear after the first non-empty node
   * - Useful for cleaning up top-level wrapper components while maintaining full visibility deeper in the tree
   *
   * **"all"**:
   * - Collapses all empty node sequences throughout the entire tree
   * - Each sequence of consecutive empty nodes becomes a marker: "... (N empty levels)"
   * - Provides the most compact view by removing all noise
   * - Useful for focusing on components with actual state/prop changes or logs
   *
   * Performance characteristics:
   * - "none": O(1) - identity function, no processing
   * - "first": O(n) - single pass, stops at first non-empty node
   * - "all": O(n) - single pass over entire array
   *
   * Markers preserve:
   * - Depth of the first empty node in the collapsed sequence
   * - Count of collapsed nodes (singular "level" or plural "levels")
   *
   * @example
   * ```typescript
   * // No filtering - see everything
   * { filterEmptyNodes: 'none' }
   *
   * // Clean up wrapper components at the top
   * { filterEmptyNodes: 'first' }
   *
   * // Maximum clarity - only show meaningful renders
   * { filterEmptyNodes: 'all' }
   * ```
   *
   * @default 'all'
   */
  filterEmptyNodes?: "none" | "first" | "all";

  /**
   * Maximum depth to traverse in the React fiber tree.
   *
   * Limits how deep the fiber traversal goes. Every React provider, context
   * wrapper, and library component (MUI ThemeProvider, Router, auth, i18n, etc.)
   * consumes depth above your own components. In provider-heavy apps your
   * components may sit at fiber depth 150–300, which means the default of 100
   * can silently exclude them from traces even though they are fully instrumented.
   *
   * Increase this value when instrumented components are missing from trace
   * output and runtime filters are empty.
   *
   * Valid range: 20–1000
   * @default 100
   */
  maxFiberDepth?: number;

  /**
   * Include all component branches in the output, even those without tracked components.
   * When false (default), only shows tracked components and their ancestor chain.
   * When true, shows all components regardless of tracking status.
   * If you don't inject useReactTracer using one of the plugins, this needs to be true to see any output.
   * @default false
   */
  includeNonTrackedBranches?: boolean;

  /**
   * Skip specific props for specific components to reduce noise in the output.
   * Useful for ignoring props that change frequently but aren't relevant for debugging
   * (e.g., theme objects, styling props, callback references).
   * @default []
   * @example
   * ```typescript
   * skippedObjectProps: [
   *   { objectName: 'Button', propNames: ['theme', 'sx'] },
   *   { objectName: 'Input', propNames: ['onChange'] }
   * ]
   * ```
   */
  skippedObjectProps?: SkippedObjectProp[];

  /**
   * Detect and warn about identical value changes.
   * Helps identify performance anti-patterns where components re-render due to
   * new object/array/function references that contain identical values.
   * When enabled, shows warnings like "⚠️ Identical value" for these cases.
   * @default true
   */
  detectIdenticalValueChanges?: DetectIdenticalValueChanges;

  /**
   * State resolution strategy for tracked components.
   *
   * Determines how ReactTracer resolves and reports state changes for components
   * that explicitly call `useReactTracer()` or have injected tracking.
   *
   * **"hybrid"** (default): Match labels against fiber hooks with inference
   * - Uses both labeled state AND fiber traversal
   * - Applies heuristics to infer nested hooks (e.g., `customHook.internal`)
   * - May include `.internal` suffixes and `unknown` labels for unmatched hooks
   * - More information but may include ambiguous unknowns
   * - Backward compatible with existing behavior
   *
   * **"labels-only"**: Use only explicitly labeled state
   * - Ignores fiber hooks entirely for tracked components
   * - Reports only state explicitly registered via `labelState()` or injection
   * - No unknowns, no `.internal` suffixes, no heuristics
   * - Cleaner output with guaranteed accuracy
   * - Best for production apps with complete labeling
   * - Fixes stable reference bug (custom hooks returning same object reference)
   *
   * **Note**: Untracked components always use fiber-based resolution regardless of this setting.
   *
   * @default "hybrid"
   */
  trackedStateResolution?: "hybrid" | "labels-only";

  /**
   * Enable per-render function caching to eliminate redundant computation.
   * When enabled, functions wrapped with withCache() will memoize results based on argument combinations.
   * Cache is global per function reference and cleared after each render cycle.
   * Minimal memory overhead; significant performance benefit for hot-path functions.
   * @default false
   */
  functionCache?: boolean;

  /**
   * Enable detailed cache performance logging.
   * When enabled, logs per-function, per-caller, per-argument-combination statistics after each render.
   * Shows cache hits, computation times, and calculated time savings.
   * Requires functionCache to be enabled.
   * @default false
   */
  functionCacheLogging?: boolean;

  /**
   * Color and styling configuration for different types of render output.
   * Supports both light and dark mode themes with customizable colors, icons, and text styles.
   */
  colors?: {
    /** Styling for definitive renders (tracked components that actually rendered). Default: #0044ff, Bold, ⚡ */
    definitiveRender?: ColorOptions;

    /** Styling for initial prop values on mount. Default: #ff00f2, Italic */
    propInitial?: ColorOptions;

    /** Styling for prop changes. Default: #ff00f2 */
    propChange?: ColorOptions;

    /** Styling for initial state values on mount. Default: #ff9100, Italic */
    stateInitial?: ColorOptions;

    /** Styling for state changes. Default: #ff9100 */
    stateChange?: ColorOptions;

    /** Styling for component log statements. Default: #00aa00 */
    logStatements?: ColorOptions;

    /** Styling for component log statements.
     * Light: Foreground: #000000, Background: #fbf6d7, ⚠️
     * Dark: Foreground: #f9f2a3, Background: #3f3c28, ⚠️   */
    warnStatements?: ColorOptions;

    /** Styling for component log statements.
     * Default: Foreground: #000000, Background: #f6eceb, ⛔
     * Default: Foreground: #f0dfd2, Background: #473635, ⛔  */
    errorStatements?: ColorOptions;

    /** Styling for reconciled components (evaluated but not changed). Default: #6b7280 (Gray-500) */
    reconciled?: ColorOptions;

    /** Styling for skipped components (internal work only). Default: #9ca3af (Gray-400) */
    skipped?: ColorOptions;

    /** Styling for identical state value warnings. Inherits from stateChange theme by default. */
    identicalStateValueWarning?: ColorOptions;

    /** Styling for identical prop value warnings. Inherits from propChange theme by default. */
    identicalPropValueWarning?: ColorOptions;

    /** Styling for other/unknown component types. Default: #000000 */
    other?: ColorOptions;
  };

  /**
   * Function name pattern that automatically starts tracing.
   * Supports glob patterns (e.g., "handle*", "fetch*") for flexible matching.
   * When the component matching this pattern renders, tracing starts automatically
   * (subject to all other filter settings).
   * @default null (no automatic start trigger)
   * @example "Counter" - Exact component name
   * @example "handle*" - All components starting with "handle"
   */
  startTriggerFunctionName?: string | null;

  /**
   * Function name pattern that automatically stops tracing.
   * Supports glob patterns (e.g., "handle*", "fetch*") for flexible matching.
   * When the component matching this pattern renders, tracing stops automatically.
   * @default null (no automatic end trigger)
   * @example "Parent" - Exact component name
   * @example "Dialog*" - All components starting with "Dialog"
   */
  endTriggerFunctionName?: string | null;

  /**
   * Controls when the end trigger stops tracing.
   * - "on-entry": Stop immediately when the end trigger component starts rendering
   * - "on-exit": Stop after the end trigger component completes rendering
   * @default "on-exit"
   */
  endTriggerMode?: "on-entry" | "on-exit";

  /**
   * Controls whether start trigger automatically re-enables tracing after end trigger.
   * - "always": After end trigger stops tracing, start trigger will restart it (repeated sequences)
   * - "once": After end trigger, remain stopped until manual restart (one-shot debugging)
   * @default "once"
   */
  triggerRearmMode?: "always" | "once";
}

export type {
  ReactTracerOptions,
  NonTrackedComponentVisibility,
  ThemeOptions,
  ColorOptions,
  SkippedObjectProp,
  DetectIdenticalValueChanges,
};
