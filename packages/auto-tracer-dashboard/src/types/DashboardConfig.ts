/**
 * Configuration for the dashboard widget.
 */
export interface DashboardConfig {
  /**
   * Enable or disable the dashboard widget.
   *
   * @default true
   */
  readonly enabled: boolean;

  /**
   * Hide the widget by default.
   * Widget will show automatically when tracer starts and persist via localStorage.
   *
   * @default true
   */
  readonly hideByDefault: boolean;

  /**
   * Position of the widget on the screen.
   *
   * @default "bottom-right"
   */
  readonly position: DashboardPosition;

  /**
   * Hotkey configuration for keyboard shortcuts.
   */
  readonly hotkeys: HotkeyConfig;
}

/**
 * Position of the dashboard widget on the screen.
 */
export type DashboardPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

/**
 * Hotkey configuration for dashboard controls.
 */
export interface HotkeyConfig {
  /**
   * Keyboard shortcut to start/stop tracing.
   *
   * @example "Ctrl+Shift+T"
   */
  readonly toggleTracing: string;

  /**
   * Keyboard shortcut to show/hide the dashboard widget.
   *
   * @example "Ctrl+Shift+D"
   */
  readonly toggleDashboard: string;
}

/**
 * Normalized (complete) dashboard configuration with all defaults applied.
 */
export interface NormalizedDashboardConfig extends DashboardConfig {
  readonly enabled: true;
  readonly hideByDefault: boolean;
  readonly position: DashboardPosition;
  readonly hotkeys: HotkeyConfig;
}

/**
 * Widget controls exposed via globalThis.autoTracer.widget.
 */
export interface WidgetControls {
  /**
   * Show the dashboard widget.
   */
  show(): void;

  /**
   * Hide the dashboard widget.
   */
  hide(): void;

  /**
   * Toggle widget visibility.
   */
  toggle(): void;

  /**
   * Check if widget is currently visible.
   */
  isVisible(): boolean;

  /**
   * Disable keyboard shortcuts.
   */
  unregisterHotkeys(): void;
}
