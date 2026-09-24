/**
 * Runtime-persisted name filter store.
 *
 * Side effects:
 * - Reads/writes the provided storage (typically localStorage).
 */
export type RuntimeNameFilterStore = {
  /**
   * Adds a filter match string.
   */
  readonly addFilter: (match: string) => void;

  /**
   * Clears only runtime filters.
   */
  readonly clearFilters: () => void;

  /**
   * Reads the current runtime filters.
   */
  readonly getFilters: () => readonly string[];

  /**
   * Returns true when the provided name matches any runtime filter.
   */
  readonly matchesName: (name: string) => boolean;
};
