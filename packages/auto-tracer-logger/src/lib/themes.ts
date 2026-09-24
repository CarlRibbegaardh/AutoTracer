import type { Theme } from "./types/Theme.js";

/**
 * Default theme preset.
 * No colors or prefixes.
 */
const defaultTheme: Theme = {
  colors: {},
  prefixes: {},
};

/**
 * Minimal theme preset.
 * Simple text prefixes and no colors.
 */
const minimal: Theme = {
  colors: {},
  prefixes: {
    fatal: "[FATAL]",
    error: "[ERROR]",
    warn: "[WARN]",
    log: "[LOG]",
    info: "[INFO]",
    debug: "[DEBUG]",
    verbose: "[VERBOSE]",
    trace: "[TRACE]",
    enter: "→",
    exit: "←",
  },
};

/**
 * Emoji theme preset.
 * Colorful styling and emoji prefixes.
 */
const emoji: Theme = {
  colors: {
    fatal: "#ff0000",
    error: "#ff4444",
    warn: "#ffaa00",
    log: "#888888",
    info: "#00aaff",
    debug: "#00ff00",
    verbose: "#aa00ff",
    trace: "#666666",
  },
  prefixes: {
    fatal: "🔥",
    error: "💥",
    warn: "⚠️",
    log: "📝",
    info: "ℹ️",
    debug: "🐛",
    verbose: "📊",
    trace: "🔍",
    enter: "▶️",
    exit: "◀️",
  },
};

/**
 * Monochrome theme preset.
 * ASCII prefixes and no colors.
 */
const monochrome: Theme = {
  colors: {},
  prefixes: {
    fatal: "[!]",
    error: "[X]",
    warn: "[*]",
    log: "[ ]",
    info: "[i]",
    debug: "[d]",
    verbose: "[v]",
    trace: "[t]",
    enter: ">",
    exit: "<",
  },
};

/**
 * Collection of preset themes.
 * Each theme is a complete Theme configuration object.
 */
export const themes = {
  default: defaultTheme,
  minimal,
  emoji,
  monochrome,
} as const;
