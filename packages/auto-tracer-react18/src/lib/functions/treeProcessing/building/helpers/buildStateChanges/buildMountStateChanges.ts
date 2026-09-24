import type { StateChangeEntry, UseStateValueEntry } from "../buildStateChanges.js";
import { filterValidMountStateValues } from "./filterValidMountStateValues.js";
import { resolveMountHookLabel } from "./resolveMountHookLabel.js";
import { findUnmatchedLabelChangesForMount } from "./findUnmatchedLabelChangesForMount.js";
import { inferNestedHookLabels } from "./inferNestedHookLabels.js";
import { internalLogger } from "@logger/internalLogger.js";
import type { HookResolutionContext } from "./HookResolutionContext.js";

/**
 * Converts a filtered mount state value to a state change entry.
 *
 * Pure function - no side effects.
 *
 * @param value - Current state value
 * @param hook - Hook object reference
 * @param context - Resolution context with anchors and tracking info
 * @returns State change entry for mount
 */
function toMountStateChange(
  value: unknown,
  hook: { memoizedState: unknown; queue: unknown; next: unknown } | null,
  context: HookResolutionContext
): StateChangeEntry {
  const resolvedName = resolveMountHookLabel(hook, context);

  return {
    name: resolvedName,
    value,
    prevValue: undefined,
    hook,
    isIdenticalValueChange: false,
  };
}

/**
 * Builds the list of state changes for a component mount.
 * Includes fiber state changes and unmatched labeled values.
 *
 * Pure function (except logging and registry reads) - no mutations.
 *
 * @param useStateValues - Extracted useState entries from the fiber
 * @param context - Resolution context with anchors and tracking info
 * @returns Array of state change entries
 */
export function buildMountStateChanges(
  useStateValues: UseStateValueEntry[],
  context: HookResolutionContext
): StateChangeEntry[] {
  internalLogger.debug(
    `buildStateChanges: Processing mount - filtering ${useStateValues.length} useState values`
  );

  const filtered = filterValidMountStateValues(useStateValues);

  const fiberStateChanges = filtered.map(({ value, hook }) => {
    return toMountStateChange(value, hook, context);
  });

  const matchedLabels = new Set(
    fiberStateChanges.map((c) => {
      return c.name;
    })
  );

  const unmatchedLabelChanges = context.trackingGUID
    ? findUnmatchedLabelChangesForMount(context.trackingGUID, matchedLabels)
    : [];

  const allChanges = [...fiberStateChanges, ...unmatchedLabelChanges];

  // Infer nested hook labels (e.g., auth.user, auth.loading) by matching
  // unlabeled hook values against properties in labeled objects
  const withInferredLabels = inferNestedHookLabels(allChanges, context.trackingGUID);

  internalLogger.trace(
    `buildStateChanges: EXIT (mount) - ${fiberStateChanges.length} fiber + ${
      unmatchedLabelChanges.length
    } unmatched = ${withInferredLabels.length} total`
  );

  return withInferredLabels;
}
