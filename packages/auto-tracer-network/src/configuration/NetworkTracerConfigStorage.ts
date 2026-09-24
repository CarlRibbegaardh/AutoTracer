/**
 * Provides the storage operation required to read NetworkTracer configuration.
 */
export interface NetworkTracerConfigStorage {
  /**
   * Returns the stored value for a key.
   *
   * @param key - Storage key to read.
   * @returns The stored value, or `null` when the key is absent.
   */
  readonly getItem: (key: string) => string | null;
}
