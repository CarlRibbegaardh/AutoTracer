import * as t from "@babel/types";

/**
 * Returns `true` when `node` is an `ExportNamedDeclaration` or `ExportDefaultDeclaration`.
 *
 * @param node - Any Babel AST node.
 * @returns `true` when the node is an export wrapper.
 */
export const isExportWrapper = (node: t.Node): node is t.ExportNamedDeclaration | t.ExportDefaultDeclaration =>
  t.isExportNamedDeclaration(node) || t.isExportDefaultDeclaration(node);
