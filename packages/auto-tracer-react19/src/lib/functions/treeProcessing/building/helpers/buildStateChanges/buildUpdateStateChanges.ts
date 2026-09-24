import type { StateChangeEntry, UseStateValueEntry } from "../buildStateChanges.js";
import { filterChangedUpdateStateValues } from "./filterChangedUpdateStateValues.js";
import { resolveUpdateHookLabel } from "./resolveUpdateHookLabel.js";
import { detectIdenticalValueChange } from "./detectIdenticalValueChange.js";
import { findUnmatchedLabelChangesForUpdate } from "./findUnmatchedLabelChangesForUpdate.js";
import { inferNestedHookLabels } from "./inferNestedHookLabels.js";
import { internalLogger } from "@logger/internalLogger.js";
import type { HookResolutionContext } from "./HookResolutionContext.js";

/**
 * Converts a filtered update state value to a state change entry.
 *
 * Pure function (except logging) - no side effects.
 *
 * @param value - Current state value
 * @param prevValue - Previous state value
 * @param hook - Hook object reference
 * @param context - Resolution context with anchors and tracking info
 * @returns State change entry for update
 */
function toUpdateStateChange(
  value: unknown,
  prevValue: unknown,
  hook: { memoizedState: unknown; queue: unknown; next: unknown } | null,
  context: HookResolutionContext
): StateChangeEntry {
  internalLogger.debug(
    `buildStateChanges: Checking identical value (update)`
  );

  const isIdenticalValueChange = detectIdenticalValueChange(prevValue, value);

  const resolvedName = resolveUpdateHookLabel(hook, context);

  return {
    name: resolvedName,
    value,
    prevValue,
    hook,
    isIdenticalValueChange,
  };
}

/**
 * Builds the list of state changes for a component update.
 * Includes fiber state changes and unmatched labeled value changes.
 *
 * Pure function (except logging and registry reads) - no mutations, no side effects.
 *
 * @param useStateValues - Extracted useState entries from the fiber
 * @param context - Resolution context with anchors and tracking info
 * @returns Array of state change entries
 */
export function buildUpdateStateChanges(
  useStateValues: UseStateValueEntry[],
  context: HookResolutionContext
): StateChangeEntry[] {
  internalLogger.debug(
    `buildStateChanges: Processing update - filtering ${useStateValues.length} useState values`
  );

  const filtered = filterChangedUpdateStateValues(useStateValues);

  const fiberStateChanges = filtered.map(({ value, prevValue, hook }) => {
    return toUpdateStateChange(
      value,
      prevValue!,
      hook,
      context
    );
  });

  const matchedLabels = new Set(
    fiberStateChanges.map((c) => {
      return c.name;
    })
  );

  internalLogger.debug(
    `buildStateChanges: Getting unmatched labels for GUID (update)`
  );

  const unmatchedLabelChanges = context.trackingGUID
    ? findUnmatchedLabelChangesForUpdate(context.trackingGUID, matchedLabels)
    : [];

  const allChanges = [...fiberStateChanges, ...unmatchedLabelChanges];

  // Infer nested hook labels (e.g., auth.user, auth.loading) by matching
  // unlabeled hook values against properties in labeled objects
  const withInferredLabels = inferNestedHookLabels(allChanges, context.trackingGUID);

  internalLogger.trace(
    `buildStateChanges: EXIT (update) - ${fiberStateChanges.length} fiber + ${
      unmatchedLabelChanges.length
    } unmatched = ${withInferredLabels.length} total`
  );

  return withInferredLabels;
}
