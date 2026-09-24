import type { CreateRuntimeNameFilterStoreParams } from "./CreateRuntimeNameFilterStoreParams.js";
import { matchesPattern } from "./matchesPattern.js";
import type { RuntimeNameFilterStore } from "./RuntimeNameFilterStore.js";

/**
 * Creates a runtime name filter store.
 *
 * The store persists string match patterns to a Storage-like implementation.
 * Match behavior is compatible with compile-time matching:
 * - Exact strings match exactly
 * - Strings containing glob characters (e.g., "*") are matched as globs
 *
 * Side effects:
 * - Reads/writes the provided storage (typically localStorage).
 *
 * @param params - Store configuration
 * @returns Runtime name filter store
 */
export function createRuntimeNameFilterStore(
  params: CreateRuntimeNameFilterStoreParams
): RuntimeNameFilterStore {
  /**
   * Returns true when a parsed JSON value is a string array.
   */
  function isStringArray(value: unknown): value is string[] {
    if (!Array.isArray(value)) return false;
    return value.every((x) => typeof x === "string");
  }

  /**
   * Normalizes a runtime filter match string.
   */
  function normalizeMatch(match: string): string {
    return match.trim();
  }

  /**
   * Reads runtime filters from the configured storage.
   */
  function readFiltersFromStorage(): string[] {
    const raw = params.storage?.getItem(params.storageKey);
    if (raw === null || raw === undefined || raw.length === 0) return [];

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!isStringArray(parsed)) return [];
      return parsed.map(normalizeMatch).filter((m) => m.length > 0);
    } catch (_error) {
      return [];
    }
  }

  /**
   * Writes runtime filters to the configured storage.
   */
  function writeFiltersToStorage(filters: readonly string[]): void {
    if (!params.storage) return;

    if (filters.length === 0) {
      params.storage.removeItem(params.storageKey);
      return;
    }

    params.storage.setItem(params.storageKey, JSON.stringify(filters));
  }

  /**
   * Adds a match string only when missing.
   */
  function addUnique(filters: readonly string[], next: string): string[] {
    if (filters.includes(next)) return [...filters];
    return [...filters, next];
  }

  let cached = readFiltersFromStorage();

  function getFilters(): readonly string[] {
    return [...cached];
  }

  function addFilter(match: string): void {
    const normalized = normalizeMatch(match);
    if (normalized.length === 0) return;

    cached = addUnique(cached, normalized);
    writeFiltersToStorage(cached);
  }

  function clearFilters(): void {
    cached = [];
    writeFiltersToStorage(cached);
  }

  function matchesName(name: string): boolean {
    for (const pattern of cached) {
      if (matchesPattern(name, pattern)) return true;
    }
    return false;
  }

  return { addFilter, clearFilters, getFilters, matchesName };
}
