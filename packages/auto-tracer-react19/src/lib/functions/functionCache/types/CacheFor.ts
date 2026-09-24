import type { CacheEntry } from "./CacheEntry.js";
import type { NestedMap } from "./NestedMap.js";

/**
 * Type alias for the cache structure of a specific function signature.
 *
 * Combines NestedMap with CacheEntry to create a fully-typed cache
 * that maps function arguments to cached results.
 *
 * @template TArgs Tuple of function argument types
 * @template TResult Function return type
 *
 * @example
 * ```typescript
 * function stringify(value: unknown): string { ... }
 * type StringifyCache = CacheFor<[unknown], string>;
 * // Expands to: Map<unknown, CacheEntry<string>>
 *
 * function equals(a: unknown, b: unknown): boolean { ... }
 * type EqualsCache = CacheFor<[unknown, unknown], boolean>;
 * // Expands to: Map<unknown, Map<unknown, CacheEntry<boolean>>>
 * ```
 */
export type CacheFor<TArgs extends unknown[], TResult> = NestedMap<
  TArgs,
  CacheEntry<TResult>
>;
