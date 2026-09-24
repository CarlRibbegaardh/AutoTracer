import { describe, expect, it } from "vitest";
import { createRuntimeNameFilterStore } from "../../src/createRuntimeNameFilterStore";

type MemoryStorage = {
  readonly getItem: (key: string) => string | null;
  readonly setItem: (key: string, value: string) => void;
  readonly removeItem: (key: string) => void;
};

function createMemoryStorage(): {
  storage: MemoryStorage;
  readRaw: (key: string) => string | null;
} {
  const map = new Map<string, string>();

  const storage: MemoryStorage = {
    getItem: (key) => {
      return map.get(key) ?? null;
    },
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };

  return {
    storage,
    readRaw: (key) => {
      return map.get(key) ?? null;
    },
  };
}

describe("createRuntimeNameFilterStore", () => {
  it("persists added filters to storage", () => {
    const { storage, readRaw } = createMemoryStorage();
    const key = "__test_runtime_filters__";
    const store = createRuntimeNameFilterStore({ storage, storageKey: key });

    store.addFilter("MyComponent");
    expect(store.getFilters()).toEqual(["MyComponent"]);
    expect(readRaw(key)).toBe(JSON.stringify(["MyComponent"]));
  });

  it("deduplicates filters", () => {
    const { storage } = createMemoryStorage();
    const store = createRuntimeNameFilterStore({
      storage,
      storageKey: "__test_runtime_filters__",
    });

    store.addFilter("MyComponent");
    store.addFilter("MyComponent");
    expect(store.getFilters()).toEqual(["MyComponent"]);
  });

  it("clears only runtime filters", () => {
    const { storage, readRaw } = createMemoryStorage();
    const key = "__test_runtime_filters__";
    const store = createRuntimeNameFilterStore({ storage, storageKey: key });

    store.addFilter("A");
    store.addFilter("B*");
    store.clearFilters();

    expect(store.getFilters()).toEqual([]);
    expect(readRaw(key)).toBe(null);
  });

  it("matches names using glob semantics when pattern has wildcards", () => {
    const { storage } = createMemoryStorage();
    const store = createRuntimeNameFilterStore({
      storage,
      storageKey: "__test_runtime_filters__",
    });

    store.addFilter("User*");
    expect(store.matchesName("UserProfile")).toBe(true);
    expect(store.matchesName("Settings")).toBe(false);
  });
});
