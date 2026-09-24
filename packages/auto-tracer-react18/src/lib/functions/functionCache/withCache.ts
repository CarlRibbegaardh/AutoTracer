import type { CacheEntry } from "./types/CacheEntry.js";
import type { CacheFor } from "./types/CacheFor.js";
import { getTraceOptions } from "../../types/globalState.js";

/**
 * Type for any callable function.
 * Used as Map key for function reference equality.
 */
type AnyFunction = (...args: never[]) => unknown;

/**
 * Global cache mapping function references to their nested argument Maps.
 * Each function gets one cache shared across all callers.
 * Exported so clearFunctionCache can access it.
 */
export const globalCache = new Map<AnyFunction, Map<unknown, unknown>>();

/**
 * Retrieves a value from the nested Map cache structure.
 * Navigates through each argument level to find the cached entry.
 *
 * @template TArgs Tuple of argument types
 * @template TResult Return type
 * @param cache The nested Map structure
 * @param args The function arguments to look up
 * @returns The cached entry if found, undefined otherwise
 */
function getCacheEntry<TArgs extends unknown[], TResult>(
  cache: CacheFor<TArgs, TResult>,
  args: TArgs
): CacheEntry<TResult> | undefined {
  let node: unknown = cache;
  for (const arg of args) {
    if (!(node instanceof Map)) return undefined;
    node = node.get(arg);
    if (node === undefined) return undefined;
  }
  return node instanceof Map ? undefined : (node as CacheEntry<TResult>);
}

/**
 * Stores a value in the nested Map cache structure.
 * Creates intermediate Map levels as needed.
 *
 * @template TArgs Tuple of argument types
 * @template TResult Return type
 * @param cache The nested Map structure
 * @param args The function arguments (cache key path)
 * @param entry The cache entry to store
 */
function setCacheEntry<TArgs extends unknown[], TResult>(
  cache: CacheFor<TArgs, TResult>,
  args: TArgs,
  entry: CacheEntry<TResult>
): void {
  let node: Map<unknown, unknown> = cache as unknown as Map<unknown, unknown>;
  for (let i = 0; i < args.length - 1; i++) {
    const key = args[i];
    let next = node.get(key);
    if (!(next instanceof Map)) {
      next = new Map();
      node.set(key, next);
    }
    node = next as Map<unknown, unknown>;
  }
  node.set(args[args.length - 1], entry);
}

/**
 * Wraps a function with per-render caching.
 *
 * Cache is GLOBAL per function reference, shared across all callers.
 * Cache is cleared after each render cycle.
 * Settings are read from global ReactTracerOptions.
 *
 * When `functionCache` is disabled, calls the function directly with zero overhead.
 * When enabled, memoizes results based on argument combinations using reference equality.
 *
 * @template TArgs Tuple of argument types
 * @template TResult Return type
 * @param functionName Name of the function (for logging only, e.g., "stringify")
 * @param caller Name of the calling context (for logging only, e.g., "matchUniqueValue")
 * @param fn The function to cache (used as cache key via reference equality)
 * @returns Cached version of the function
 *
 * @example
 * ```typescript
 * import { withCache } from './functionCache';
 * import { stringify } from './stringify';
 *
 * const cachedStringify = withCache("stringify", "matchUniqueValue", stringify);
 *
 * // Later calls with same arguments hit the cache
 * const result1 = cachedStringify(obj); // MISS - computes
 * const result2 = cachedStringify(obj); // HIT - cached
 * ```
 */
export function withCache<TArgs extends unknown[], TResult>(
  functionName: string,
  caller: string,
  fn: (...args: TArgs) => TResult
): (...args: TArgs) => TResult {
  // Get or create cache for THIS function reference
  let cache = globalCache.get(fn as AnyFunction) as
    | CacheFor<TArgs, TResult>
    | undefined;
  if (!cache) {
    cache = new Map() as unknown as CacheFor<TArgs, TResult>;
    globalCache.set(
      fn as AnyFunction,
      cache as unknown as Map<unknown, unknown>
    );
  }

  return (...args: TArgs): TResult => {
    // When caching is disabled, call function directly (zero overhead)
    if (!getTraceOptions().functionCache) {
      return fn(...args);
    }

    // Check for cache hit
    const hit = getCacheEntry(cache!, args);
    if (hit) {
      // Update per-caller access count if logging is enabled
      if (getTraceOptions().functionCacheLogging && hit.meta) {
        const currentCount = hit.meta.callerAccess.get(caller) || 0;
        hit.meta.callerAccess.set(caller, currentCount + 1);
      }
      return hit.value;
    }

    // Cache miss - compute value
    const t0 = getTraceOptions().functionCacheLogging ? performance.now() : 0;
    const value = fn(...args);

    // Store in cache with metadata
    const callerAccess = new Map<string, number>();
    callerAccess.set(caller, 1);

    const entry: CacheEntry<TResult> = {
      value,
      meta: getTraceOptions().functionCacheLogging
        ? {
            functionName,
            args,
            firstComputeTimeMs: performance.now() - t0,
            callerAccess,
          }
        : undefined,
    };

    setCacheEntry(cache!, args, entry);
    return value;
  };
}
