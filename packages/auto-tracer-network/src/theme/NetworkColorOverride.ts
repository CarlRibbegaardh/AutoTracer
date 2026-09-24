import type { NetworkThemeOptions } from "./NetworkThemeOptions.js";

/**
 * Optional light and dark overrides for one Network theme category.
 */
export type NetworkColorOverride = Readonly<{
  lightMode?: NetworkThemeOptions;
  darkMode?: NetworkThemeOptions;
}>;
