import { resolveHookLabel } from "../../../../hookLabels.js";
import { withCache } from "../../../../functionCache/withCache.js";
import { findHookIndex } from "./findHookIndex.js";
import { internalLogger } from "@logger/internalLogger.js";
import type { HookResolutionContext } from "./HookResolutionContext.js";

// Cached resolveHookLabel for repeated hook label resolution
const cachedResolveHookLabel = withCache(
  "resolveHookLabel",
  "buildStateChanges",
  resolveHookLabel
);

/**
 * Resolves the label name for a state hook during update.
 * Uses cached resolution for performance.
 *
 * Pure function (except for logging and caching) - deterministic label resolution.
 *
 * @param hook - The hook object to resolve label for
 * @param context - Resolution context with anchors and tracking info
 * @returns Resolved label name
 */
export function resolveUpdateHookLabel(
  hook: { memoizedState: unknown; queue: unknown; next: unknown } | null,
  context: HookResolutionContext
): string {
  const { anchors, allAnchors, trackingGUID } = context;
  internalLogger.debug(`buildStateChanges: Resolving hook label (update)`);

  const anchorIndex = findHookIndex(hook, anchors);
  const resolvedName = cachedResolveHookLabel(
    anchorIndex,
    hook?.memoizedState,
    { guid: trackingGUID ?? "", allAnchors }
  );
  internalLogger.debug(`buildStateChanges: Resolved to "${resolvedName}"`);

  return resolvedName;
}
