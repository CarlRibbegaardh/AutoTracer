import * as t from "@babel/types";

/**
 * hasExistingUseReactTracerImport
 *
 * Returns true if the given program AST already has a named import for
 * `useReactTracer` from the specified import source.
 */
export function hasExistingUseReactTracerImport(
  ast: t.File,
  importSource: string
): boolean {
  for (const stmt of ast.program.body) {
    if (t.isImportDeclaration(stmt) && stmt.source.value === importSource) {
      return stmt.specifiers.some(
        (
          spec:
            | t.ImportSpecifier
            | t.ImportDefaultSpecifier
            | t.ImportNamespaceSpecifier
        ) =>
          t.isImportSpecifier(spec) &&
          t.isIdentifier(spec.imported) &&
          spec.imported.name === "useReactTracer"
      );
    }
  }
  return false;
}
