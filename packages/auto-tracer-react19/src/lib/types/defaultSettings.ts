import type { ReactTracerOptions } from "../interfaces/ReactTracerOptions.js";

/**
 * Default configuration for reactTracer
 * This is the single source of truth for all default settings
 */
export const defaultReactTracerOptions: ReactTracerOptions = {
  // outputMode: "devtools", // Startup config only; intentionally unset by default to avoid overriding an existing global outputMode.
  enabled: false, // Start dormant by default; opt into active startup explicitly
  detectIdenticalValueChanges: true,
  includeReconciled: "never",
  includeSkipped: "never",
  includeMount: "never",
  includeRendered: "never",
  filterEmptyNodes: "all", // No empty node filtering by default (backward compatible)
  includeNonTrackedBranches: false, // Only show tracked components and their parent chain by default
  maxFiberDepth: 500, // Maximum fiber traversal depth
  skippedObjectProps: [], // Skip specific props for specific object types
  internalLogLevel: "error", // Silent by default - only show errors
  showFlags: false,
  functionCache: false, // Disabled by default for production safety
  functionCacheLogging: false, // Disabled by default (requires functionCache: true)

  // Trigger configuration
  startTriggerFunctionName: null, // No automatic start trigger by default
  endTriggerFunctionName: null, // No automatic end trigger by default
  endTriggerMode: "on-exit", // Stop after end trigger completes (default)
  triggerRearmMode: "once", // Allow repeated trigger sequences (default)

  // Default styling (matching comments in ReactTracerOptions.ts)
  colors: {
    definitiveRender: {
      lightMode: { text: "#0044ff", bold: true }, // Blue, Bold
      darkMode: { text: "#4fd6ff", bold: true }, // Lighter blue
      icon: "⚡",
    },
    propInitial: {
      icon: undefined, // Initial prop value
      lightMode: { text: "#c900bf", italic: true }, // Magenta, Italic
      darkMode: { text: "#ff77e8", italic: true }, // Lighter magenta for dark mode
    },
    propChange: {
      icon: undefined, // Prop changed
      lightMode: { text: "#c900bf" }, // Magenta
      darkMode: { text: "#ff77e8" }, // Lighter magenta for dark mode
    },
    stateInitial: {
      icon: undefined, // Initial state value
      lightMode: { text: "#df7f02", italic: true }, // Orange, Italic
      darkMode: { text: "#ffcf33", italic: true }, // Lighter orange for dark mode
    },
    stateChange: {
      icon: undefined, // State changed
      lightMode: { text: "#df7f02" }, // Orange
      darkMode: { text: "#ffcf33" }, // Lighter orange for dark mode
    },
    logStatements: {
      icon: undefined, // Log statements
      lightMode: { text: "#00aa00" }, // Green
      darkMode: { text: "#4ade80" }, // Lighter green for dark mode
    },
    warnStatements: {
      icon: "⚠️", // Warning statements
      lightMode: { text: "#000000", background: "#fbf6d7" }, // Black on light yellow
      darkMode: { text: "#f9f2a3", background: "#3f3c28" }, // Light yellow on dark yellow-brown
    },
    errorStatements: {
      icon: "❌", // Error statements
      lightMode: { text: "#000000", background: "#f6eceb" }, // Black on light red
      darkMode: { text: "#f0dfd2", background: "#473635" }, // Light red on dark red-brown
    },
    reconciled: {
      lightMode: { text: "#9ca3af" }, // Gray-500
      darkMode: { text: "#9ca3af" }, // Gray-500
      icon: undefined, // Reconciled/reused
    },
    skipped: {
      lightMode: { text: "#8e8e8e" }, // Gray-500
      darkMode: { text: "#9ca3af" }, // Gray-500
      icon: undefined, // Skipped
    },
    // Distinct identical state value warning styling (icon only; inherit rest)
    identicalStateValueWarning: {
      icon: "⚠️", // Warning icon
      lightMode: { text: "#df7f02", bold: true }, // Orange
      darkMode: { text: "#ffcf33", bold: true }, // Lighter orange for dark mode
    },
    // Distinct identical prop value warning styling (icon only; inherit rest)
    identicalPropValueWarning: {
      icon: "⚠️", // Warning icon
      lightMode: { text: "#c900bf", bold: true }, // Magenta
      darkMode: { text: "#ff77e8", bold: true }, // Lighter magenta for dark mode
    },
    other: {
      lightMode: { text: "#000000" }, // Black
      darkMode: { text: "#ffffff" }, // White
      icon: undefined, // Other/unknown
    },
  },
};
