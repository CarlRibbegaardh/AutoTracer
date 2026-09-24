import * as t from "@babel/types";
import { isExportWrapper } from "./isExportWrapper.js";
import type { FunctionLikePath } from "./FunctionLikePath.js";

/**
 * Returns the AST node that owns the leading comments for a function-like path.
 *
 * @remarks
 * Babel attaches leading comments to the **outermost** node in the statement.
 * This means:
 * - For `export function foo() {}` → comments live on `ExportNamedDeclaration`
 * - For `const foo = () => {}` → comments live on `VariableDeclaration`
 * - For plain `function foo() {}` → comments live on `FunctionDeclaration`
 * - For `ObjectMethod` and `ClassMethod` → comments live on the method node itself
 *
 * @param path - The Babel NodePath of the function-like node.
 * @returns The AST node that carries leading comments.
 */
export const getEffectiveCommentHost = (path: FunctionLikePath): t.Node => {
  const parent = path.parent;

  // export function foo() {} — comments on the ExportDeclaration
  if (isExportWrapper(parent)) return parent;

  // const foo = () => {} — walk up to VariableDeclaration
  if (t.isVariableDeclarator(parent)) {
    const declarationPath = path.parentPath?.parentPath;
    if (declarationPath != null) {
      const declParent = declarationPath.parent;
      // export const foo = () => {} — comments on ExportDeclaration
      if (isExportWrapper(declParent)) return declParent;
      return declarationPath.node;
    }
  }

  // obj.foo = function() {} — walk up to ExpressionStatement
  if (t.isAssignmentExpression(parent)) {
    const exprPath = path.parentPath?.parentPath;
    if (exprPath != null && t.isExpressionStatement(exprPath.node)) return exprPath.node;
  }

  // setTimeout(function() {}) — walk up to ExpressionStatement
  if (t.isCallExpression(parent)) {
    const exprPath = path.parentPath?.parentPath;
    if (exprPath != null && t.isExpressionStatement(exprPath.node)) return exprPath.node;
  }

  return path.node;
};
