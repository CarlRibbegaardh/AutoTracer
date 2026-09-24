import type { NetworkTracerConfigStorage } from "./NetworkTracerConfigStorage.js";
import type { NetworkTracerConfigWriteStorage } from "./NetworkTracerConfigWriteStorage.js";

/**
 * Provides the storage operations required by the live NetworkTracer configuration store.
 */
export interface NetworkTracerConfigReadWriteStorage
  extends NetworkTracerConfigStorage,
    NetworkTracerConfigWriteStorage {
  /**
   * Removes a stored value.
   *
   * @param key - Storage key to remove.
   */
  readonly removeItem: (key: string) => void;
}
