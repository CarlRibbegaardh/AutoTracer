import { createXhrInstanceStateStore } from "./createXhrInstanceStateStore.js";
import { createXhrRequestHeadersStore } from "./createXhrRequestHeadersStore.js";

/**
 * Creates lazy, isolated tracing storage for XHR instances.
 *
 * @returns A registry that returns one stable store per XHR instance.
 */
export function createXhrInstanceStoreRegistry(): Readonly<{
  getInstanceStore: (
    xhr: XMLHttpRequest,
  ) => ReturnType<typeof createXhrInstanceStateStore> &
    ReturnType<typeof createXhrRequestHeadersStore>;
}> {
  const stores = new WeakMap<
    XMLHttpRequest,
    ReturnType<typeof createXhrInstanceStateStore> &
      ReturnType<typeof createXhrRequestHeadersStore>
  >();

  /** Returns the stable tracing store for one XHR instance. */
  function getInstanceStore(
    xhr: XMLHttpRequest,
  ): ReturnType<typeof createXhrInstanceStateStore> &
    ReturnType<typeof createXhrRequestHeadersStore> {
    const existingStore = stores.get(xhr);
    if (existingStore !== undefined) return existingStore;

    const store = {
      ...createXhrInstanceStateStore(),
      ...createXhrRequestHeadersStore(),
    };
    stores.set(xhr, store);
    return store;
  }

  return { getInstanceStore };
}
