import { resolveHookLabel } from "../../../../hookLabels.js";
import { findHookIndex } from "./findHookIndex.js";
import { internalLogger } from "@logger/internalLogger.js";
import type { HookResolutionContext } from "./HookResolutionContext.js";

/**
 * Resolves the label name for a state hook during mount.
 * Handles guard clauses for invalid hooks.
 *
 * Pure function (except for logging) - deterministic label resolution.
 *
 * @param hook - The hook object to resolve label for
 * @param context - Resolution context with anchors and tracking info
 * @returns Resolved label name
 */
export function resolveMountHookLabel(
  hook: { memoizedState: unknown; queue: unknown; next: unknown } | null,
  context: HookResolutionContext
): string {
  const { anchors, allAnchors, trackingGUID } = context;
  internalLogger.debug(`buildStateChanges: Resolving hook label (mount)`);
  internalLogger.debug(`buildStateChanges: About to call anchors.indexOf(hook)`);
  internalLogger.debug(
    `buildStateChanges: hook type=${typeof hook}, hook=${
      hook ? "exists" : "null"
    }`
  );
  internalLogger.debug(`buildStateChanges: anchors.length=${anchors.length}`);

  const anchorIndex = findHookIndex(hook, anchors);
  internalLogger.debug(`buildStateChanges: Got anchorIndex=${anchorIndex}`);
  internalLogger.debug(`buildStateChanges: About to validate hook structure`);

  // Guard: Validate hook has required properties before accessing
  if (!hook || typeof hook !== "object") {
    internalLogger.debug(
      `buildStateChanges: GUARD FAILED - hook is not an object, skipping`
    );

    return `state${anchorIndex}`;
  }

  if (!("memoizedState" in hook)) {
    internalLogger.debug(
      `buildStateChanges: GUARD FAILED - hook missing memoizedState property, skipping`
    );

    return `state${anchorIndex}`;
  }

  internalLogger.debug(
    `buildStateChanges: Guard passed, accessing memoizedState`
  );

  const memoizedState = hook.memoizedState;

  internalLogger.trace(
    `buildStateChanges: Got memoizedState, type=${typeof memoizedState}`
  );
  internalLogger.trace(
    `buildStateChanges: About to call resolveHookLabel with:`
  );
  internalLogger.trace(
    `  guid=${trackingGUID}`,
    `anchorIndex=${anchorIndex}`,
    `memoizedState type=${typeof memoizedState}`,
    `allAnchors.length=${allAnchors.length}`
  );
  if (allAnchors.length > 0 && allAnchors[0]) {
    internalLogger.trace(
      `  allAnchors[0]=`,
      allAnchors[0],
      `has index?=${"index" in allAnchors[0]}`,
      `has value?=${"value" in allAnchors[0]}`
    );
  }

  const resolvedName = resolveHookLabel(
    anchorIndex,
    memoizedState,
    { guid: trackingGUID ?? "", allAnchors }
  );

  internalLogger.debug(`buildStateChanges: Resolved to "${resolvedName}"`);

  return resolvedName;
}
