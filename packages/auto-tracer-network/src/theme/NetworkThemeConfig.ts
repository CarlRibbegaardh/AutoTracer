import type { NetworkColorOptions } from "./NetworkColorOptions.js";

/**
 * Complete semantic theme configuration for NetworkTracer output.
 */
export type NetworkThemeConfig = Readonly<{
  identity: NetworkColorOptions;
  method: NetworkColorOptions;
  detailLabel: NetworkColorOptions;
  error: NetworkColorOptions;
  redirect: NetworkColorOptions;
  runtimeControl: NetworkColorOptions;
}>;
