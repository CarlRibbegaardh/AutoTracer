import * as t from "@babel/types";

/**
 * Extracts the function name from various AST node types.
 *
 * This helper extracts the identifier name from function declarations,
 * variable declarators, and other patterns where a function has a name.
 * Returns undefined for anonymous functions.
 *
 * @param node - The AST node to extract the name from
 * @returns The function name if available, undefined for anonymous functions
 *
 * @example
 * ```typescript
 * // Function declaration
 * function MyComponent() {} // → "MyComponent"
 *
 * // Variable declarator
 * const MyComponent = () => {} // → "MyComponent"
 *
 * // Anonymous
 * () => {} // → undefined
 * ```
 *
 * @internal
 */
export function extractFunctionName(node: t.Node): string | undefined {
  if (t.isFunctionDeclaration(node) && node.id) {
    return node.id.name;
  }

  if (t.isVariableDeclarator(node) && t.isIdentifier(node.id)) {
    return node.id.name;
  }

  // Bare function expressions and arrow functions are anonymous
  return undefined;
}
