import type { NetworkThemeOptions } from "./NetworkThemeOptions.js";

/**
 * Light and dark styles for one NetworkTracer semantic category.
 */
export type NetworkColorOptions = Readonly<{
  lightMode: NetworkThemeOptions;
  darkMode: NetworkThemeOptions;
}>;
