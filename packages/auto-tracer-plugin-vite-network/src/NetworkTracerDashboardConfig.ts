/**
 * Configures the shared AutoTracer Dashboard requested by the Network Vite plugin.
 */
export interface NetworkTracerDashboardConfig {
  /** Controls whether Dashboard tags are emitted. */
  readonly enabled?: boolean;
  /** Controls initial Dashboard visibility. */
  readonly hideByDefault?: boolean;
  /** Places the Dashboard widget in the browser viewport. */
  readonly position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  /** Configures Dashboard keyboard shortcuts. */
  readonly hotkeys?: Readonly<{
    toggleTracing?: string;
    toggleDashboard?: string;
  }>;
}
