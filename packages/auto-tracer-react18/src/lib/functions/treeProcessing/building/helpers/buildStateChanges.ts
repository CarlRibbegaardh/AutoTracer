import type { Hook } from "../../../hookMapping/types.js";
import { internalLogger } from "@logger/internalLogger.js";
import type { AnchorEntry } from "./getHookAnchors.js";
import { buildMountStateChanges } from "./buildStateChanges/buildMountStateChanges.js";
import { buildUpdateStateChanges } from "./buildStateChanges/buildUpdateStateChanges.js";
import { withPrevLabelPersistence } from "./buildStateChanges/withPrevLabelPersistence.js";
import type { HookResolutionContext } from "./buildStateChanges/HookResolutionContext.js";

export interface StateChangeEntry {
  name: string;
  value: unknown;
  prevValue: unknown;
  hook: {
    memoizedState: unknown;
    queue: unknown;
    next: unknown;
  } | null;
  isIdenticalValueChange: boolean;
}

export interface UseStateValueEntry {
  name: string;
  value: unknown;
  prevValue?: unknown;
  hook: {
    memoizedState: unknown;
    queue: unknown;
    next: unknown;
  } | null;
}

/**
 * Build the list of state changes for a fiber, handling both mount and update cases.
 * Dispatches to specialized pure functions based on mount state.
 * Contains a deliberate side effect on updates (savePrevLabelsForGuid) via wrapper.
 *
 * @param isNewMount - Whether this is the first mount of the component
 * @param useStateValues - Extracted useState entries from the fiber
 * @param anchors - Ordered list of stateful hook anchors
 * @param allAnchors - Anchor index/value pairs for label resolution
 * @param trackingGUID - Tracking GUID if component is tracked, otherwise null
 * @returns Array of state change entries
 */
export function buildStateChanges(
  isNewMount: boolean,
  useStateValues: UseStateValueEntry[],
  anchors: readonly Hook[],
  allAnchors: AnchorEntry[],
  trackingGUID: string | null
): StateChangeEntry[] {
  const h = internalLogger.enter(
    `buildStateChanges: ENTER (mount=${isNewMount}, useStateValues=${useStateValues.length}, trackingGUID=${trackingGUID})`
  );

  const context: HookResolutionContext = {
    anchors,
    allAnchors,
    trackingGUID,
  };

  const result = isNewMount
    ? buildMountStateChanges(useStateValues, context)
    : trackingGUID
    ? withPrevLabelPersistence(
        buildUpdateStateChanges(useStateValues, context),
        trackingGUID
      )
    : buildUpdateStateChanges(useStateValues, context);

  internalLogger.exit(h);

  return result;
}
