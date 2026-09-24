/**
 * @file Pure function to match a hook by unique value.
 */

import { stringify } from "../stringify.js";
import { toComparableString } from "./toComparableString.js";
import { checkKeyOrderMatches } from "./checkKeyOrderMatches.js";
import type { LabelEntry } from "./LabelEntry.js";
import { internalLogger } from "@logger/internalLogger.js";
import { withCache } from "../functionCache/withCache.js";

// Cached versions of all functions used in matching
const cachedStringify = withCache("stringify", "matchUniqueValue", stringify);
const cachedToComparableString = withCache(
  "toComparableString",
  "matchUniqueValue",
  toComparableString
);
const cachedCheckKeyOrderMatches = withCache(
  "checkKeyOrderMatches",
  "matchUniqueValue",
  checkKeyOrderMatches
);

/**
 * Attempts to match a hook with a unique value to a registered label.
 * Performs value equality check with key order verification.
 *
 * @param labels - All registered label entries for the component
 * @param anchorValue - Current value of the hook to match
 * @returns The matching label entry, or null if no match found
 */
export function matchUniqueValue(
  labels: readonly LabelEntry[],
  anchorValue: unknown
): LabelEntry | null {
  const h = internalLogger.enter(`matchUniqueValue`);

  const anchorComparable = cachedToComparableString(anchorValue);

  const match = labels.find((l) => {
    // First check if comparable strings match (value equality)
    // Use cached stringify for registered value to preserve function IDs
    const labelComparable = cachedStringify(l.normalizedValue);
    if (labelComparable !== anchorComparable) {
      return false;
    }

    // Verify key order matches for objects (fix for Bug 2)
    return cachedCheckKeyOrderMatches(l.normalizedValue, anchorValue);
  });

  internalLogger.exit(h);
  return match ?? null;
}
