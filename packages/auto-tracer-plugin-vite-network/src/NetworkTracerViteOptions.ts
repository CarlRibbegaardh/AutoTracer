import type { NetworkTracerDashboardConfig } from "./NetworkTracerDashboardConfig.js";
import type { NetworkTracerInitializerDefaults } from "./NetworkTracerInitializerDefaults.js";

/**
 * Configures NetworkTracer Vite bootstrap behavior.
 */
export interface NetworkTracerViteOptions {
  /**
   * Controls whether NetworkTracer is included in application output.
   *
   * @default true
   */
  readonly inject?: boolean;
  /** Shared Dashboard configuration emitted before Dashboard mounting. */
  readonly dashboardConfig?: NetworkTracerDashboardConfig;
  /** Project defaults passed to the runtime, below persisted developer settings. */
  readonly initializerDefaults?: NetworkTracerInitializerDefaults;
}
