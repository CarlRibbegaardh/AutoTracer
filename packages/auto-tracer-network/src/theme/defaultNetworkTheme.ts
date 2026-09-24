import type { NetworkThemeConfig } from "./NetworkThemeConfig.js";

/**
 * Default light and dark semantic styles for NetworkTracer output.
 */
export const defaultNetworkTheme = {
  identity: {
    lightMode: { text: "#0000ff", bold: true },
    darkMode: { text: "#569cd6", bold: true },
  },
  method: {
    lightMode: { text: "#795e26" },
    darkMode: { text: "#dcdcaa" },
  },
  detailLabel: {
    lightMode: { text: "#267f99" },
    darkMode: { text: "#4ec9b0" },
  },
  error: {
    lightMode: { text: "#cd3131", bold: true },
    darkMode: { text: "#f44747", bold: true },
  },
  redirect: {
    lightMode: { text: "#9d5d00", bold: true },
    darkMode: { text: "#d7ba7d", bold: true },
  },
  runtimeControl: {
    lightMode: { text: "#008000" },
    darkMode: { text: "#6a9955" },
  },
} as const satisfies NetworkThemeConfig;
