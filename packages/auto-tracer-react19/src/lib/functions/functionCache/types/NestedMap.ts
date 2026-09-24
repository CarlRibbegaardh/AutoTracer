/**
 * Recursively constructs a nested Map structure for arbitrary arity function caching.
 *
 * Each argument becomes a key in a nested Map, with the final argument mapping to the Leaf type.
 * This provides O(1) lookup per argument level while maintaining type safety.
 *
 * @template Keys Readonly tuple of argument types
 * @template Leaf The type stored at the leaf (e.g., CacheEntry<TResult>)
 *
 * @example
 * ```typescript
 * // For function: (a: number, b: string) => boolean
 * type Cache = NestedMap<[number, string], CacheEntry<boolean>>;
 * // Expands to: Map<number, Map<string, CacheEntry<boolean>>>
 *
 * // For function: (x: object) => string
 * type Cache = NestedMap<[object], CacheEntry<string>>;
 * // Expands to: Map<object, CacheEntry<string>>
 * ```
 */
export type NestedMap<Keys extends readonly unknown[], Leaf> =
  Keys extends readonly [infer K, ...infer Rest]
    ? Map<K, NestedMap<Rest, Leaf>>
    : Leaf;
