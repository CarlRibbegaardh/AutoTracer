import { stringify } from "./stringify.js";
import { withCache } from "./functionCache/withCache.js";
import { internalLogger } from "@logger/internalLogger.js";

// Cached stringify for performance
const cachedStringify = withCache("stringify", "areValuesIdentical", stringify);

/**
 * Checks if two values are identical by comparing their stringified representations.
 *
 * Uses stringify to preserve function identities - each function gets a unique ID like "(fn:123)".
 * This ensures that different function instances are treated as different values.
 *
 * Example: {handler: fn1} ≠ {handler: fn2} (different function instances)
 * Example: {handler: fn1} = {handler: fn1} (same function instance)
 *
 * @param prevValue - The previous value
 * @param value - The current value
 * @returns true if values are identical (including function instance identity)
 */
export function areValuesIdentical(
  prevValue: unknown,
  value: unknown
): boolean {
  const h = internalLogger.enter("areValuesIdentical", prevValue, value);
  try {
    // Fast path: if they're reference-equal, they're identical
    if (prevValue === value) {
      return true;
    }

    // Stringify both values (preserves function IDs like "(fn:123)")
    const stringifiedPrev = cachedStringify(prevValue);
    const stringifiedCurrent = cachedStringify(value);

    // String comparison
    return stringifiedPrev === stringifiedCurrent;
  } catch {
    // Comparison failed - assume not identical
    return false;
  } finally {
    internalLogger.exit(h);
  }
}
