/**
 * React runtime filtering state.
 */
export type ReactRuntimeFilteringState = {
  /**
   * Adds a runtime filter for traced component names.
   *
   * Side effects:
   * - Persists to localStorage when available.
   */
  readonly addFilter: (match: string) => void;

  /**
   * Clears only runtime filters.
   *
   * Side effects:
   * - Clears localStorage for runtime filters when available.
   */
  readonly clearFilters: () => void;

  /**
   * Shows the current runtime filters in a copy/paste friendly format.
   *
   * @returns A config snippet compatible with compile-time filters.
   */
  readonly showFilters: () => string;

  /**
   * Enables or disables filterMode.
   *
   * When enabled, log rows include an action element for adding runtime filters.
   * This setting is NOT persisted.
   *
   * @param enabled - Optional explicit value; defaults to true when omitted
   * @returns Current filterMode enabled state
   */
  readonly filterMode: (enabled?: boolean) => boolean;

  /**
   * Returns whether filterMode is enabled.
   */
  readonly isFilterModeEnabled: () => boolean;

  /**
   * Returns true when the name matches the current runtime filters.
   */
  readonly matchesName: (name: string) => boolean;

  /**
   * Creates a filter action element for the provided component name.
   */
  readonly createFilterAction: (name: string) => unknown;
};
