import type { NormalizedBabelPluginFlowConfig } from "./types/index.js";
import { shouldInstrumentFunction, getFunctionName, findParentFunctionName } from "./helpers.js";
import type { FunctionLikePath } from "./FunctionLikePath.js";

/**
 * Returns `true` when the ancestor function passes eligibility checks.
 *
 * @param ancestorPath - The Babel NodePath of the ancestor function-like node.
 * @param config - The normalized plugin configuration.
 * @returns `true` when the ancestor should have its pragmas inherited.
 */
export const isAncestorEligible = (
  ancestorPath: FunctionLikePath,
  config: NormalizedBabelPluginFlowConfig,
): boolean => {
  const parentName = findParentFunctionName(ancestorPath);
  const functionName = getFunctionName(ancestorPath, parentName);
  return shouldInstrumentFunction(functionName, config.include, config.exclude);
};
