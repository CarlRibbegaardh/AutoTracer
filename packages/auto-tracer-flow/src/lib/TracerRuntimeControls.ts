/**
 * Runtime control surface exposed per tracer namespace.
 */
export interface TracerRuntimeControls {
  /**
   * Starts tracing.
   */
  start(): void;

  /**
   * Stops tracing.
   */
  stop(): void;

  /**
   * Returns whether tracing is currently enabled.
   */
  isEnabled(): boolean;

  /**
   * Adds a runtime filter for traced names.
   *
   * Side effects:
   * - Persists to localStorage when available.
   */
  addFilter(match: string): void;

  /**
   * Shows the current runtime filters in a copy/paste friendly format.
   *
   * @returns A config snippet compatible with compile-time filters.
   */
  showFilters(): string;

  /**
   * Clears only the runtime filters.
   *
   * Side effects:
   * - Clears localStorage for runtime filters when available.
   */
  clearFilters(): void;

  /**
   * Enables or disables filterMode.
   *
   * When enabled, log rows include an action element for adding runtime filters.
   * This setting is NOT persisted.
   *
   * @param enabled - Optional explicit value; defaults to true when omitted
   * @returns Current filterMode enabled state
   */
  filterMode(enabled?: boolean): boolean;

  /**
   * Enable tracer on page load.
   * When true, tracer automatically starts on initialization.
   *
   * Side effects:
   * - Persists to localStorage when available.
   *
   * @param value - Enable or disable auto-start on load
   */
  setEnabledOnLoad(value: boolean): void;

  /**
   * Check if tracer is configured to start on page load.
   *
   * @returns True if tracer will auto-start on next page load
   */
  getEnabledOnLoad(): boolean;

  /**
   * Set auto-stop limit for top-level function calls (depth 0).
   *
   * Side effects:
   * - Persists to localStorage when available.
   *
   * @param limit - Limit value, or null to disable
   */
  setAutoStopTopLevel?(limit: number | null): void;

  /**
   * Get auto-stop top-level limit.
   *
   * @returns Limit value, or null if disabled
   */
  getAutoStopTopLevel?(): number | null;

  /**
   * Set auto-stop all functions limit.
   *
   * Side effects:
   * - Persists to localStorage when available.
   *
   * @param limit - Limit value, or null to disable
   */
  setAutoStopAll?(limit: number | null): void;

  /**
   * Get auto-stop all functions limit.
   *
   * @returns Limit value, or null if disabled
   */
  getAutoStopAll?(): number | null;

  /**
   * Get current top-level count.
   *
   * @returns Current top-level call count
   */
  getTopLevelCount?(): number;

  /**
   * Get current total count.
   *
   * @returns Current total call count
   */
  getTotalCount?(): number;

  /**
   * Reset counts to zero.
   */
  resetCounts?(): void;

  /**
   * Set start trigger function name pattern.
   * Tracing begins when a function matching this pattern is entered.
   *
   * Side effects:
   * - Persists to localStorage when available.
   *
   * @param pattern - Glob pattern or null to disable
   */
  setStartTrigger?(pattern: string | null): void;

  /**
   * Get start trigger function name pattern.
   *
   * @returns Current pattern or null if disabled
   */
  getStartTrigger?(): string | null;

  /**
   * Set end trigger function name pattern.
   * Tracing stops when a function matching this pattern is entered/exited (see endTriggerMode).
   *
   * Side effects:
   * - Persists to localStorage when available.
   *
   * @param pattern - Glob pattern or null to disable
   */
  setEndTrigger?(pattern: string | null): void;

  /**
   * Get end trigger function name pattern.
   *
   * @returns Current pattern or null if disabled
   */
  getEndTrigger?(): string | null;

  /**
   * Set when end trigger should fire.
   *
   * Side effects:
   * - Persists to localStorage when available.
   *
   * @param mode - "on-entry" fires when function is entered, "on-exit" fires when function exits
   */
  setEndTriggerMode?(mode: "on-entry" | "on-exit"): void;

  /**
   * Get end trigger mode.
   *
   * @returns Current mode ("on-entry" or "on-exit")
   */
  getEndTriggerMode?(): "on-entry" | "on-exit";

  /**
   * Set trigger re-arm behavior.
   *
   * Side effects:
   * - Persists to localStorage when available.
   *
   * @param mode - "always" allows repeated trigger sequences, "once" disables after first sequence
   */
  setTriggerRearmMode?(mode: "always" | "once"): void;

  /**
   * Get trigger re-arm mode.
   *
   * @returns Current mode ("always" or "once")
   */
  getTriggerRearmMode?(): "always" | "once";

  /**
   * Clear all trigger settings and reset to defaults.
   *
   * Side effects:
   * - Persists to localStorage when available.
   */
  clearAllTriggers?(): void;
}
