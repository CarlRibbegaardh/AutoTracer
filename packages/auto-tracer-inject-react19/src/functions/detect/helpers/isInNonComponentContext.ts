import * as t from "@babel/types";
import type { NodePath } from "@babel/traverse";

/**
 * Known function call names that accept callbacks but are NOT React components/HOCs.
 * Functions passed to these should not be treated as components.
 */
const NON_COMPONENT_PARENT_CALLS = [
  // React lazy/dynamic imports
  "lazy",

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

  // Timing functions
  "setTimeout",
  "setInterval",
  "requestAnimationFrame",
  "requestIdleCallback",

  // Event handlers
  "addEventListener",
  "removeEventListener",

  // Other common callback patterns
  "queueMicrotask",
];

/**
 * Detects if a function is being passed as an argument to a known non-component context.
 *
 * This function checks whether the provided function node is a direct argument to calls
 * like `lazy()`, `Promise.then()`, `array.map()`, etc., which accept callbacks but should
 * not be treated as React components.
 *
 * @param path - The Babel NodePath to analyze (can be from parent traversal or direct node)
 * @returns True if the function is in a non-component context, false otherwise
 *
 * @example
 * ```typescript
 * // Returns true - lazy callback is not a component
 * const Lazy = lazy(() => import('./Component'));
 *
 * // Returns true - promise callback is not a component
 * fetch('/api').then((res) => res.json());
 *
 * // Returns true - map callback is not a component
 * items.map((item) => <Item key={item.id} />);
 *
 * // Returns false - memo wraps a component
 * const MemoComp = memo(() => <div />);
 * ```
 *
 * @internal
 */
export function isInNonComponentContext(
  path: NodePath | null | undefined
): boolean {
  if (!path) return false;

  let current: NodePath | null = path;

  // Walk up the tree to find if we're inside a call expression
  while (current) {
    const parent = current.parent;

    if (t.isCallExpression(parent)) {
      // Check if current node is an argument to the call
      const currentNode = current.node;
      const isArgument = parent.arguments.some((arg) => arg === currentNode);

      if (isArgument) {
        const callee = parent.callee;

        // Check for direct call: lazy(...), map(...), etc.
        if (t.isIdentifier(callee)) {
          if (NON_COMPONENT_PARENT_CALLS.includes(callee.name)) {
            return true;
          }
        }

        // Check for member call: React.lazy(...), promise.then(...), array.map(...)
        if (t.isMemberExpression(callee) && t.isIdentifier(callee.property)) {
          if (NON_COMPONENT_PARENT_CALLS.includes(callee.property.name)) {
            return true;
          }
        }
      }
    }

    current = current.parentPath;
  }

  return false;
}
