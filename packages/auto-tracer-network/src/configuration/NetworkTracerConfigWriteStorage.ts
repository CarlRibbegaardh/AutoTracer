/**
 * Provides the storage operation required to persist NetworkTracer configuration.
 */
export interface NetworkTracerConfigWriteStorage {
  /**
   * Stores a value under a key.
   *
   * @param key - Storage key to write.
   * @param value - Serialized value to store.
   */
  readonly setItem: (key: string, value: string) => void;
}
