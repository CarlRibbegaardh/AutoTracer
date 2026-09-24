import type { RuntimeNameFilterStorage } from "./RuntimeNameFilterStorage.js";

/**
 * Parameters for creating a runtime name filter store.
 */
export type CreateRuntimeNameFilterStoreParams = {
  /**
   * Storage key used to persist runtime filters.
   */
  readonly storageKey: string;

  /**
   * Optional Storage-like implementation (e.g., window.localStorage).
   *
   * When omitted, the store behaves as in-memory only.
   */
  readonly storage?: RuntimeNameFilterStorage;
};
