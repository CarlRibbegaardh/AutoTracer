import * as t from "@babel/types";

/**
 * Known calls that are NOT HOCs and should NOT be unwrapped.
 * These are patterns like lazy(), which accept functions but those functions
 * are not React components.
 */
const NON_HOC_CALLS = [
  // React APIs
  "lazy",
  "createElement",

  // Promise methods
  "then",
  "catch",
  "finally",

  // Array methods
  "map",
  "filter",
  "reduce",
  "forEach",
  "find",
  "findIndex",
  "some",
  "every",
  "flatMap",
  "reduceRight",
  "sort",
  "reverse",

  // Timing functions
  "setTimeout",
  "setInterval",
  "requestAnimationFrame",
  "requestIdleCallback",

  // Event handlers
  "addEventListener",
  "removeEventListener",

  // Other callback patterns
  "queueMicrotask",
];

/**
 * Attempts to unwrap nested Higher-Order Component (HOC) calls to find the inner function.
 *
 * This function recursively traverses HOC call expressions (like `memo()`, `forwardRef()`)
 * to extract the actual function component that should be transformed. It explicitly
 * rejects known non-HOC patterns like `lazy()` to prevent incorrectly treating
 * module loaders as components.
 *
 * **Supported HOCs:**
 * - `React.memo(Component)`
 * - `React.forwardRef(Component)`
 * - Nested combinations: `memo(forwardRef(Component))`
 *
 * **Rejected Patterns:**
 * - `React.lazy(() => import(...))` - Module loader, not a component wrapper
 * - `React.createElement(...)` - Not an HOC wrapper
 *
 * @param expr - The expression to unwrap (typically a call expression)
 * @param depth - Current recursion depth to prevent infinite loops (max: 3)
 * @returns The unwrapped function expression, or null if not found, depth exceeded, or non-HOC detected
 *
 * @example
 * ```typescript
 * // Input: memo(forwardRef(function MyComponent() { ... }))
 * // Output: function MyComponent() { ... }
 *
 * // Input: lazy(() => import('./Component'))
 * // Output: null (rejected - lazy is not an HOC)
 * ```
 *
 * @internal
 */
export function unwrapFunctionFromHOCs(
  expr: t.Expression,
  depth: number
): t.Function | null {
  if (depth > 3) return null;

  if (t.isArrowFunctionExpression(expr) || t.isFunctionExpression(expr)) {
    return expr;
  }

  if (t.isCallExpression(expr)) {
    const callee = expr.callee;

    // Check if this is a non-HOC call that should be rejected
    if (t.isIdentifier(callee)) {
      if (NON_HOC_CALLS.includes(callee.name)) {
        return null; // Reject - not an HOC
      }
      // Allow named HOCs or unknown calls (conservative unwrapping)
    }

    if (t.isMemberExpression(callee) && t.isIdentifier(callee.property)) {
      if (NON_HOC_CALLS.includes(callee.property.name)) {
        return null; // Reject - React.lazy, etc.
      }
      // Allow React.memo, React.forwardRef, etc.
    }

    // Recursively unwrap HOC arguments
    const args = expr.arguments;
    for (const arg of args) {
      if (t.isExpression(arg)) {
        const found = unwrapFunctionFromHOCs(arg, depth + 1);
        if (found) return found;
      }
    }
  }

  return null;
}
