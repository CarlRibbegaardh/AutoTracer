/**
 * A minimal Storage-like interface.
 */
export type RuntimeNameFilterStorage = {
  /**
   * Reads a value by key.
   */
  readonly getItem: (key: string) => string | null;

  /**
   * Writes a value by key.
   */
  readonly setItem: (key: string, value: string) => void;

  /**
   * Removes a value by key.
   */
  readonly removeItem: (key: string) => void;
};
