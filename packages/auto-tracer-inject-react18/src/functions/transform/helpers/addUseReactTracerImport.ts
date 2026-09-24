import * as t from "@babel/types";

/**
 * Adds an import statement for useReactTracer to the top of the AST file.
 *
 * This function creates and prepends an ES6 import statement for the useReactTracer
 * hook from the configured import source. The import is added at the beginning
 * of the program body to ensure it's available for injected code.
 *
 * @param ast - The Babel AST file to modify
 * @param importSource - The module path to import useReactTracer from
 *
 * @example
 * ```typescript
 * // Before: empty file
 * // After: import { useReactTracer } from '@autotracer/react18';
 * ```
 *
 * @internal
 */
export function addUseReactTracerImport(ast: t.File, importSource: string) {
  const importDeclaration = t.importDeclaration(
    [
      t.importSpecifier(
        t.identifier("useReactTracer"),
        t.identifier("useReactTracer")
      ),
    ],
    t.stringLiteral(importSource)
  );

  ast.program.body.unshift(importDeclaration);
}
