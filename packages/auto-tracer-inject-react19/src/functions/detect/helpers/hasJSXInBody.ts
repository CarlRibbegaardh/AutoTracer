import * as t from "@babel/types";
import traverse from "@babel/traverse";

// Fix for Babel traverse default export issues
const traverseDefault =
  typeof traverse === "function" ? traverse : (traverse as any).default;

/**
 * Detects whether a function contains JSX anywhere in its body.
 *
 * This function performs a deep traversal of the function body to detect JSX elements
 * or fragments, including those in conditional statements, nested blocks, or variables.
 *
 * **Important:** Only direct JSX in the function body is detected. JSX inside nested
 * functions is ignored to prevent false positives from inner implementation details.
 *
 * @param func - The function AST node to analyze
 * @returns True if JSX is found anywhere in the function body, false otherwise
 *
 * @example
 * ```typescript
 * // Returns true - JSX in return statement
 * function Component() {
 *   return <div>Hello</div>;
 * }
 *
 * // Returns true - JSX in conditional
 * function ConditionalComponent({ show }) {
 *   if (show) return <div>Visible</div>;
 *   return null;
 * }
 *
 * // Returns true - JSX in variable
 * function WithVariable() {
 *   const element = <span>Text</span>;
 *   return element;
 * }
 *
 * // Returns false - JSX only in nested function
 * function Utility() {
 *   const render = () => <div />;
 *   return 1;
 * }
 *
 * // Returns false - no JSX
 * function utility() {
 *   return { data: 'value' };
 * }
 * ```
 *
 * @internal
 */
export function hasJSXInBody(func: t.Function): boolean {
  // Handle concise arrow functions with JSX
  if (t.isArrowFunctionExpression(func) && !t.isBlockStatement(func.body)) {
    return t.isJSXElement(func.body) || t.isJSXFragment(func.body);
  }

  // No body to analyze
  if (!t.isBlockStatement(func.body)) {
    return false;
  }

  let foundJSX = false;

  try {
    traverseDefault(func.body, {
      noScope: true, // Don't build scope - we just need to find JSX
      JSXElement(path: any) {
        foundJSX = true;
        path.stop(); // Stop traversal for performance
      },
      JSXFragment(path: any) {
        foundJSX = true;
        path.stop(); // Stop traversal for performance
      },
      // Skip nested function bodies to avoid contamination from inner implementation details
      Function(path: any) {
        if (path.node !== func) {
          path.skip();
        }
      },
    });
  } catch {
    // If traversal fails, conservatively return false
    return false;
  }

  return foundJSX;
}
