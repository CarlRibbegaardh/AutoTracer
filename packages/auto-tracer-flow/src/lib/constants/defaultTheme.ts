import type { FlowThemeConfig } from "../types/FlowThemeConfig.js";

/**
 * Default theme for flow tracing output.
 *
 * Design philosophy:
 * - **Monochrome by default** - No text or background colors defined
 * - **Bold for group boundaries** - All entry/exit points are bold for pattern recognition
 * - **Italic for parameters** - Distinguishes parameter logging
 * - **Icons for semantic meaning** - Visual indicators for different output types
 *
 * Rationale:
 * - React18 tracer is colorful (needs to distinguish props/state/renders)
 * - Flow tracer should be monochrome to avoid visual competition
 * - User's own console.log() statements should stand out
 * - Final colors will be tuned when running React18 and Flow tracers together
 * - Bold group boundaries leverage pattern recognition (console groups are always bold)
 *
 * @example
 * ```typescript
 * import { DEFAULT_FLOW_THEME } from "@autotracer/flow";
 *
 * const tracer = createFlowTracer(logger, {
 *   theme: DEFAULT_FLOW_THEME
 * });
 * ```
 */
export const DEFAULT_FLOW_THEME: Required<FlowThemeConfig> = {
  /**
   * Async function start: "functionName (async started)"
   * Bold for group boundary, arrow icon for "entering"
   */
  asyncStart: {
    lightMode: { bold: true },
    darkMode: { bold: true },
    icon: "→",
  },

  /**
   * Async function completion: "functionName (async completed)"
   * Bold for group boundary, arrow icon for "exiting"
   */
  asyncComplete: {
    lightMode: { bold: true },
    darkMode: { bold: true },
    icon: "←",
  },

  /**
   * Function entry: "→ functionName"
   * Bold for group boundary, arrow icon for "entering"
   */
  functionEnter: {
    lightMode: { bold: true },
    darkMode: { bold: true },
    icon: "→",
  },

  /**
   * Function exit: "← functionName (elapsed: 1.2ms)"
   * Bold for group boundary, arrow icon for "exiting"
   */
  functionExit: {
    lightMode: { bold: true },
    darkMode: { bold: true },
    icon: "←",
  },

  /**
   * Parameter logging: "param paramName: value"
   * Italic to distinguish from other output
   */
  parameter: {
    lightMode: { italic: true },
    darkMode: { italic: true },
  },

  /**
   * Return value logging: "returned: value"
   * Plain styling - no special emphasis
   */
  returnValue: {
    lightMode: {},
    darkMode: {},
  },

  /**
   * Exception logging: "💥 Exception in functionName: Error"
   * Bold for emphasis, explosion icon for "error"
   * Note: This will likely get red color even in monochrome
   */
  exception: {
    lightMode: { bold: true },
    darkMode: { bold: true },
    icon: "💥",
  },

  /**
   * Runtime control messages: "Flow tracing started"
   * Plain styling, wrench icon for "control/config"
   */
  runtimeControl: {
    lightMode: {},
    darkMode: {},
    icon: "🔧",
  },
};
