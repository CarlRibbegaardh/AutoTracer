import { getFunctionPragmas } from "@autotracer/filter-utils";
import type { PragmaResult } from "@autotracer/filter-utils";
import type { NormalizedBabelPluginFlowConfig } from "./types/index.js";
import { getEffectiveCommentHost } from "./getEffectiveCommentHost.js";
import { collectAncestorPragmas } from "./collectAncestorPragmas.js";
import type { FunctionLikePath } from "./FunctionLikePath.js";

/**
 * Combines local and ancestor pragma state for the given function-like path.
 *
 * @remarks
 * - `hasDisable` cascades: if any ancestor or the local node has `@trace-disable`,
 *   the result has `hasDisable = true`.
 * - `hasTrace` is only `true` when the effective `hasDisable` is `false` AND either the
 *   local node or an ancestor has `@trace`.
 * - Ancestor pragmas from **ineligible** nodes are ignored by {@link collectAncestorPragmas}.
 *
 * @param path - The Babel NodePath of the function-like node.
 * @param config - The normalized plugin configuration.
 * @returns The effective combined {@link PragmaResult} for this node.
 */
export const getEffectiveFunctionPragmas = (
  path: FunctionLikePath,
  config: NormalizedBabelPluginFlowConfig,
): PragmaResult => {
  const host = getEffectiveCommentHost(path);
  const local: PragmaResult = getFunctionPragmas(host);
  const ancestor: PragmaResult = collectAncestorPragmas(path, config);

  const hasDisable = local.hasDisable || ancestor.hasDisable;
  const hasTrace = (local.hasTrace || ancestor.hasTrace) && !hasDisable;

  return { hasTrace, hasDisable };
};
