import type { NetworkColorOverride } from "./NetworkColorOverride.js";

/**
 * Partial semantic overrides for a Network theme.
 */
export type NetworkThemeOverride = Readonly<{
  identity?: NetworkColorOverride;
  method?: NetworkColorOverride;
  detailLabel?: NetworkColorOverride;
  error?: NetworkColorOverride;
  redirect?: NetworkColorOverride;
  runtimeControl?: NetworkColorOverride;
}>;
