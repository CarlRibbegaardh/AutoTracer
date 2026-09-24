/**
 * @file Resolves hook label using value-based matching with ordinal disambiguation.
 */

import { toComparableString } from "../toComparableString.js";
import { withCache } from "../../functionCache/withCache.js";
import { getLabelsForGuid } from "./getLabelsForGuid.js";
import { updateNormalizedValue } from "./updateNormalizedValue.js";
import { internalLogger } from "@logger/internalLogger.js";
import { isReactInternalObject } from "../isReactInternalObject.js";
import { groupAnchorsByValue } from "../groupAnchorsByValue.js";
import { tryUniqueValueMatch } from "../tryUniqueValueMatch.js";
import { tryDuplicateValueMatch } from "../tryDuplicateValueMatch.js";
import type { HookLabelContext } from "../HookLabelContext.js";
import { detectIndexConflict } from "./detectIndexConflict.js";

// Cached toComparableString for hook label resolution
const cachedToComparableString = withCache(
  "toComparableString",
  "resolveHookLabel",
  toComparableString
);

/**
 * Resolve hook label using value-based matching with ordinal disambiguation.
 *
 * **Normalization**: Uses Structural Comparison Normalization for matching
 * - Current value → structurally normalized → compared to stored normalized values
 * - Functions → `"(fn)"` for comparison
 * - Enables structural matching when function instances change
 *
 * Matching strategy:
 * 1. Guard against React internals (early return "unknown")
 * 2. Convert anchor value to comparable string
 * 3. Group fiber anchors by matching value
 * 4. Unique value → try direct match then structural match
 * 5. Duplicate values → try ordinal, constraints, then structural match
 *
 * @param anchorIndex - Index of the anchor in the memoizedState chain
 * @param anchorValue - Current value of the hook state
 * @param context - Resolution context with GUID and all fiber anchors
 * @returns A resolved label, a union of possible labels with 'unknown' (in source order), or 'unknown' if no match
 */
export function resolveHookLabel(
  anchorIndex: number,
  anchorValue: unknown,
  context: HookLabelContext
): string {
  const h = internalLogger.enter(
    `resolveHookLabel: guid=${
      context.guid
    }, anchorIndex=${anchorIndex}, anchorValue type=${typeof anchorValue}, allFiberAnchors.length=${
      context.allAnchors.length
    }`
  );

  // Get stored labels for this component (needed for index conflict detection)
  const labels = getLabelsForGuid(context.guid);

  // Guard: Detect React internal objects
  if (isReactInternalObject(anchorValue)) {
    const indexConflict = detectIndexConflict(anchorIndex, labels);
    internalLogger.exit(h);
    return indexConflict ?? "unknown";
  }

  // Convert anchor value to comparable string
  let anchorComparable: string;
  try {
    anchorComparable = cachedToComparableString(anchorValue);
  } catch (error) {
    internalLogger.info(
      `resolveHookLabel: toComparableString FAILED - ${error}. Checking for index conflict`
    );
    const indexConflict = detectIndexConflict(anchorIndex, labels);
    internalLogger.exit(h);
    return indexConflict ?? "unknown";
  }

  // Group fiber anchors by matching value
  const valueGroup = groupAnchorsByValue(context.allAnchors, anchorComparable);

  // Scenario 1: Unique value in fiber
  if (valueGroup.length === 1) {
    const result = tryUniqueValueMatch(
      labels,
      anchorIndex,
      anchorValue,
      context.allAnchors
    );

    if (result.success && result.label) {
      if (result.updatedNormalizedValue !== null) {
        updateNormalizedValue(
          context.guid,
          result.label,
          result.updatedNormalizedValue
        );
      }
      internalLogger.exit(h);
      return result.label;
    }

    const indexConflict = detectIndexConflict(anchorIndex, labels);
    internalLogger.exit(h);
    return indexConflict ?? "unknown";
  }

  // Scenarios 2 & 3: Duplicate values
  const result = tryDuplicateValueMatch(
    labels,
    anchorIndex,
    anchorValue,
    anchorComparable,
    valueGroup,
    context.allAnchors
  );

  if (result.success && result.label) {
    if (result.updatedNormalizedValue !== null) {
      updateNormalizedValue(
        context.guid,
        result.label,
        result.updatedNormalizedValue
      );
    }
    internalLogger.exit(h);
    return result.label;
  }

  const indexConflict = detectIndexConflict(anchorIndex, labels);
  internalLogger.exit(h);
  return indexConflict ?? "unknown";
}
