import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import type { FunctionLikePath } from "./FunctionLikePath.js";

/**
 * Type guard narrowing `NodePath<Node>` to a {@link FunctionLikePath}.
 *
 * @param p - Any Babel NodePath.
 * @returns `true` when `p` is a function-like path.
 */
export const isFunctionLikePath = (p: NodePath<t.Node>): p is FunctionLikePath =>
  t.isFunctionDeclaration(p.node) ||
  t.isFunctionExpression(p.node) ||
  t.isArrowFunctionExpression(p.node) ||
  t.isObjectMethod(p.node) ||
  t.isClassMethod(p.node);
