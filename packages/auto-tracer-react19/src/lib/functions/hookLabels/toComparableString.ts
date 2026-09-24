/**
 * @file Pure function to create comparable strings for hook values.
 */

import { internalLogger } from "@logger/internalLogger.js";
import { normalizeValue } from "../normalization/normalizeValue.js";
import { stringify } from "../stringify.js";
import { withCache } from "../functionCache/withCache.js";

// Cached versions for performance (eliminates redundant normalization/serialization)
const cachedNormalizeValue = withCache(
  "normalizeValue",
  "toComparableString",
  normalizeValue
);
const cachedStringify = withCache(
  "stringify",
  "toComparableString",
  stringify
);

/**
 * Converts a value to a comparable string for matching purposes.
 *
 * Two-step process maintains function identity for matching:
 * 1. normalizeValue: Shallow normalization (object properties with functions → "(fn)")
 * 2. stringify: Deep normalization with function IDs (standalone functions → "(fn:N)")
 *
 * This preserves function identity which is CRITICAL for matching standalone function state.
 * When a hook's value IS a function (e.g., callback state), we must preserve its ID to match
 * it against the stored labelEntry.normalizedValue.
 *
 * Note: The optimization to use stringifyStructural broke function matching because:
 * - Stored: labelEntry.normalizedValue = normalizeValue(fn) = fn → stringify(fn) = "(fn:1)"
 * - Anchor: stringifyStructural(fn) = "(fn)"
 * - Result: "(fn)" !== "(fn:1)" → NO MATCH!
 *
 * @param value - The value to convert
 * @returns A stringified representation with function IDs for identity-preserving comparison
 */
export function toComparableString(value: unknown): string {
  const h = internalLogger.enter(`toComparableString`);
  const normalized = cachedNormalizeValue(value);
  const result = cachedStringify(normalized);
  internalLogger.exit(h);
  return result;
}
