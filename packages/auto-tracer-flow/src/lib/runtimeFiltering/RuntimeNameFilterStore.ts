/**
 * A minimal runtime name filter store interface.
 */
export type RuntimeNameFilterStore = {
  /**
   * Returns true when a name matches any runtime filter.
   */
  readonly matchesName: (name: string) => boolean;
};
