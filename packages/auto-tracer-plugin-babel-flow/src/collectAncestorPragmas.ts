import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { getFunctionPragmas } from "@autotracer/filter-utils";
import type { PragmaResult } from "@autotracer/filter-utils";
import type { NormalizedBabelPluginFlowConfig } from "./types/index.js";
import { getEffectiveCommentHost } from "./getEffectiveCommentHost.js";
import type { FunctionLikePath } from "./FunctionLikePath.js";
import { isFunctionLikePath } from "./isFunctionLikePath.js";
import { isAncestorEligible } from "./isAncestorEligible.js";
import { merge } from "./merge.js";
import { EMPTY } from "./EMPTY.js";

/**
 * Walks up the ancestor chain from `path` and collects accumulated pragma state
 * from all **eligible** enclosing function-like nodes.
 *
 * @remarks
 * Pragma state on **ineligible** ancestor nodes is not inherited.
 *
 * @param path - The Babel NodePath of the function-like node whose ancestors to inspect.
 * @param config - The normalized plugin configuration.
 * @returns Accumulated `PragmaResult` representing the combined ancestor pragma state.
 */
export const collectAncestorPragmas = (
  path: FunctionLikePath,
  config: NormalizedBabelPluginFlowConfig,
): PragmaResult => {
  let current: NodePath<t.Node> | null = path.parentPath;
  let accumulated = EMPTY;

  while (current != null) {
    if (isFunctionLikePath(current)) {
      if (isAncestorEligible(current, config)) {
        const host = getEffectiveCommentHost(current);
        const pragmas = getFunctionPragmas(host);
        accumulated = merge(accumulated, pragmas);
      }
    }
    current = current.parentPath;
  }

  return accumulated;
};
