import {
  createRuntimeNameFilterStore,
} from "@autotracer/filter-utils";

import type { ReactRuntimeFilteringState } from "./ReactRuntimeFilteringState.js";

let cached: ReactRuntimeFilteringState | undefined;

/**
 * Gets the singleton React runtime filtering state.
 *
 * Side effects:
 * - Reads/writes localStorage for persisted runtime filters when available.
 */
export function getReactRuntimeFilteringState(): ReactRuntimeFilteringState {
  type StorageLike = {
    readonly getItem: (key: string) => string | null;
    readonly setItem: (key: string, value: string) => void;
    readonly removeItem: (key: string) => void;
  };

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  function getLocalStorageOrUndefined(): StorageLike | undefined {
    try {
      const candidate: unknown = Reflect.get(globalThis, "localStorage");
      if (!isRecord(candidate)) return undefined;
      const getItem = Reflect.get(candidate, "getItem");
      const setItem = Reflect.get(candidate, "setItem");
      const removeItem = Reflect.get(candidate, "removeItem");

      if (
        typeof getItem === "function" &&
        typeof setItem === "function" &&
        typeof removeItem === "function"
      ) {
        return {
          getItem: (key) => {
            const result: unknown = Reflect.apply(getItem, candidate, [key]);
            return typeof result === "string" ? result : null;
          },
          setItem: (key, value) => {
            Reflect.apply(setItem, candidate, [key, value]);
          },
          removeItem: (key) => {
            Reflect.apply(removeItem, candidate, [key]);
          },
        };
      }

      return undefined;
    } catch (_error) {
      return undefined;
    }
  }

  function formatReactRuntimeFiltersForCopyPaste(
    filters: readonly string[]
  ): string {
    const inner = filters
      .map((x) => {
        return JSON.stringify(x);
      })
      .join(", ");
    return `exclude: { components: [${inner}] }`;
  }

  if (cached) return cached;

  const store = createRuntimeNameFilterStore({
    storage: getLocalStorageOrUndefined(),
    storageKey: "__autotracer.react18.runtimeFilters.v1",
  });

  let isFilterModeEnabled = false;

  function filterMode(enabled?: boolean): boolean {
    isFilterModeEnabled = enabled ?? true;
    return isFilterModeEnabled;
  }

  function addFilter(match: string): void {
    store.addFilter(match);
  }

  function clearFilters(): void {
    store.clearFilters();
  }

  function showFilters(): string {
    const snippet = formatReactRuntimeFiltersForCopyPaste(store.getFilters());
    // Intentionally print the snippet as a copy/paste target.
    // eslint-disable-next-line local-rules/no-console-disallow
    console.log(snippet);
    return snippet;
  }

  function matchesName(name: string): boolean {
    return store.matchesName(name);
  }

  function createFilterAction(name: string): unknown {
    return `autoTracer.reactTracer.addFilter(${JSON.stringify(name)})`;
  }

  cached = {
    addFilter,
    clearFilters,
    showFilters,
    filterMode,
    isFilterModeEnabled: () => {
      return isFilterModeEnabled;
    },
    matchesName,
    createFilterAction,
  };

  return cached;
}
