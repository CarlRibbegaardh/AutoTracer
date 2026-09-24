import * as t from "@babel/types";
import traverse from "@babel/traverse";

// Fix for Babel traverse default export issues
const traverseDefault =
  typeof traverse === "function" ? traverse : (traverse as any).default;

/**
 * Default React hook name pattern - matches hooks starting with 'use' followed by uppercase.
 * This covers both built-in hooks (useState, useEffect) and custom hooks (useCustomHook).
 */
const DEFAULT_HOOK_PATTERN = /^use[A-Z]/;

/**
 * Known non-component instrumentation hooks that should not be treated as
 * evidence that a function is a React component.
 * This prevents self-validation where transformed code re-validates itself.
 */
const IGNORED_HOOK_NAMES = new Set(["useReactTracer"]);

/**
 * Detects whether a function calls any React hooks.
 *
 * This function analyzes the function body to check for calls to React hooks
 * (built-in or custom) by looking for function calls matching the hook naming pattern.
 * A function that calls hooks is a strong signal that it's a React component or custom hook.
 *
 * **Important:** Only direct hook calls in the function body are detected. Hook calls
 * inside nested functions are ignored to prevent false positives from inner implementation details.
 *
 * **Note:** This is a lexical heuristic based on callee naming. It does not resolve bindings,
 * so it may produce false positives for non-React functions whose names match the hook pattern.
 * Member expression calls are restricted to the `React.*` namespace to reduce false positives.
 *
 * @param func - The function AST node to analyze
 * @param hookPattern - Optional custom regex pattern to match hook names (default: /^use[A-Z]/)
 * @returns True if the function contains at least one hook call, false otherwise
 *
 * @example
 * ```typescript
 * // Returns true - calls useState directly
 * function MyComponent() {
 *   const [count, setCount] = useState(0);
 *   return <div>{count}</div>;
 * }
 *
 * // Returns false - hook call is in nested function
 * function Wrapper() {
 *   function inner() {
 *     useState(0);
 *   }
 *   return null;
 * }
 *
 * // Returns false - no hook calls
 * function parseJSON(str) {
 *   return JSON.parse(str);
 * }
 *
 * // Returns false - instrumentation artifact excluded
 * function helper() {
 *   useReactTracer({ name: "helper" });
 * }
 * ```
 *
 * @internal
 */
export function callsReactHooks(
  func: t.Function,
  hookPattern?: RegExp,
): boolean {
  // Normalize regex to remove stateful flags (g, y) that can cause inconsistent results
  const sourcePattern = hookPattern || DEFAULT_HOOK_PATTERN;
  const pattern = new RegExp(
    sourcePattern.source,
    sourcePattern.flags.replace(/[gy]/g, ""),
  );
  let hasHookCall = false;

  const visitCallExpression = (path: any) => {
    const callee = path.node.callee;

    // Direct hook call: useState(), useEffect(), useCustomHook()
    if (
      t.isIdentifier(callee) &&
      pattern.test(callee.name) &&
      !IGNORED_HOOK_NAMES.has(callee.name)
    ) {
      hasHookCall = true;
      path.stop(); // Stop traversal early for performance
      return;
    }

    // Member expression hook call: React.useState() only
    // Restricted to React namespace to avoid false positives like helpers.useThing()
    if (
      t.isMemberExpression(callee) &&
      t.isIdentifier(callee.object) &&
      callee.object.name === "React" &&
      t.isIdentifier(callee.property) &&
      pattern.test(callee.property.name) &&
      !IGNORED_HOOK_NAMES.has(callee.property.name)
    ) {
      hasHookCall = true;
      path.stop();
    }
  };

  try {
    // Analyze block statement bodies
    if (t.isBlockStatement(func.body)) {
      traverseDefault(func.body, {
        noScope: true, // Don't build scope - we just need to find hook-like calls
        CallExpression: visitCallExpression,
        // Skip nested function bodies to avoid contamination from inner implementation details
        Function(path: any) {
          if (path.node !== func) {
            path.skip();
          }
        },
      });
      return hasHookCall;
    }

    // Analyze expression-bodied arrow functions: const useX = () => useY()
    // Special case: if expression body itself is a function, no direct hooks can be called
    if (t.isArrowFunctionExpression(func.body) || t.isFunctionExpression(func.body)) {
      return false;
    }

    // The Function skip handler will catch nested function bodies in other expressions
    traverseDefault(func.body, {
      noScope: true,
      CallExpression: visitCallExpression,
      // Skip nested functions in expression bodies too
      Function(path: any) {
        path.skip();
      },
    });
  } catch (error) {
    // If traversal fails, conservatively return false
    return false;
  }

  return hasHookCall;
}
