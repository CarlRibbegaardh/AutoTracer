import * as t from "@babel/types";
import type { NodePath } from "@babel/traverse";
import { shouldInstrumentTarget } from "@autotracer/filter-utils";

/**
 * Extracts the most meaningful name from a function chain for filtering purposes.
 * Pure function with no side effects.
 *
 * Strategy:
 * 1. If chain contains known contextual calls (useCallback, map, etc.),
 *    use the variable name that precedes them
 * 2. Otherwise, use the last segment (the actual function's own name)
 *
 * @param functionName - Full function name chain (e.g., "App:useCallback:handleClick")
 * @returns Extracted meaningful name for filtering
 *
 * @example
 * extractFunctionNameFromChain("App:useCallback:handleClick") // => "handleClick"
 * extractFunctionNameFromChain("App:handleClick") // => "handleClick"
 * extractFunctionNameFromChain("anonymous") // => "anonymous"
 */
export function extractFunctionNameFromChain(functionName: string): string {
  // Known hook/utility calls that are contextual wrappers, not the meaningful name
  const contextualCalls = new Set([
    "useCallback",
    "useMemo",
    "useEffect",
    "useLayoutEffect",
    "useReducer",
    "map",
    "filter",
    "reduce",
    "forEach",
    "find",
    "some",
    "every",
    "then",
    "catch",
    "finally",
    "setTimeout",
    "setInterval",
    "requestAnimationFrame",
  ]);

  if (!functionName.includes(":")) {
    return functionName;
  }

  const segments = functionName.split(":");

  // Check if any segment is a contextual call
  const hasContextualCall = segments.some((seg) => contextualCalls.has(seg));

  if (hasContextualCall) {
    // Find the variable name (first non-parent, non-contextual, non-anonymous segment)
    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i];
      if (!contextualCalls.has(segment) && segment !== "anonymous") {
        return segment; // Use the first meaningful name we find
      }
    }
    return "anonymous"; // No meaningful name found
  } else {
    // No contextual calls - this is plain nesting like "App:handleClick" or "outer:inner:helper"
    // Use the last segment (the function's own name)
    return segments[segments.length - 1];
  }
}

/**
 * Checks if a function should be instrumented based on include/exclude patterns.
 * Extracts meaningful name from chain and delegates to shared filter-utils implementation.
 * Pure function with no side effects.
 *
 * @param functionName - Full function name chain (e.g., "App:useCallback:handleClick")
 * @param include - Include patterns
 * @param exclude - Exclude patterns
 * @returns True if function should be instrumented
 */
export function shouldInstrumentFunction(
  functionName: string,
  include?: { functions?: Array<string | RegExp> },
  exclude?: { functions?: Array<string | RegExp> }
): boolean {
  const filterName = extractFunctionNameFromChain(functionName);

  return shouldInstrumentTarget(
    filterName,
    include?.functions,
    exclude?.functions,
    "anonymous"
  );
}

/**
 * Finds the parent function's name by traversing up the AST.
 * Includes intermediate function calls (like useCallback, useMemo) in the chain.
 * Pure function with no side effects.
 *
 * @param path - Babel AST path
 * @returns Parent function name or undefined if no parent function
 */
export function findParentFunctionName(
  path:
    | NodePath<t.FunctionDeclaration>
    | NodePath<t.FunctionExpression>
    | NodePath<t.ArrowFunctionExpression>
    | NodePath<t.ObjectMethod>
    | NodePath<t.ClassMethod>
): string | undefined {
  let current: NodePath<t.Node> | null = path.parentPath;
  const segments: string[] = [];
  let foundCallExpression = false;

  while (current !== null) {
    // Check if this function is an argument to a function call
    if (current.isCallExpression()) {
      const callee = current.node.callee;
      let calleeName: string | undefined;

      // Extract the name of the function being called
      if (t.isIdentifier(callee)) {
        calleeName = callee.name;
      } else if (t.isMemberExpression(callee) && t.isIdentifier(callee.property)) {
        calleeName = callee.property.name;
      }

      if (calleeName) {
        segments.unshift(calleeName);
        foundCallExpression = true;
      }
    }

    // Only capture variable names if we've found a call expression
    // This prevents capturing the variable name when the function IS the variable
    // e.g., const foo = () => {} should be "foo", not "foo:foo"
    // but const x = useCallback(() => {}) should include "x"
    if (foundCallExpression && current.isVariableDeclarator()) {
      const id = current.node.id;
      if (t.isIdentifier(id)) {
        segments.unshift(id.name);
      }
    }

    // Check if we've reached a parent function
    if (
      current.isFunctionDeclaration() ||
      current.isFunctionExpression() ||
      current.isArrowFunctionExpression() ||
      current.isObjectMethod() ||
      current.isClassMethod()
    ) {
      if (current.isFunctionDeclaration()) {
        const grandparentName = findParentFunctionName(current);
        const parentFunctionName = getFunctionName(current, grandparentName);
        if (segments.length > 0) {
          return `${parentFunctionName}:${segments.join(":")}`;
        }
        return parentFunctionName;
      }

      if (current.isFunctionExpression()) {
        const grandparentName = findParentFunctionName(current);
        const parentFunctionName = getFunctionName(current, grandparentName);
        if (segments.length > 0) {
          return `${parentFunctionName}:${segments.join(":")}`;
        }
        return parentFunctionName;
      }

      if (current.isArrowFunctionExpression()) {
        const grandparentName = findParentFunctionName(current);
        const parentFunctionName = getFunctionName(current, grandparentName);
        if (segments.length > 0) {
          return `${parentFunctionName}:${segments.join(":")}`;
        }
        return parentFunctionName;
      }

      if (current.isObjectMethod()) {
        const grandparentName = findParentFunctionName(current);
        const parentFunctionName = getFunctionName(current, grandparentName);
        if (segments.length > 0) {
          return `${parentFunctionName}:${segments.join(":")}`;
        }
        return parentFunctionName;
      }

      if (current.isClassMethod()) {
        const grandparentName = findParentFunctionName(current);
        const parentFunctionName = getFunctionName(current, grandparentName);
        if (segments.length > 0) {
          return `${parentFunctionName}:${segments.join(":")}`;
        }
        return parentFunctionName;
      }

      return segments.length > 0 ? segments.join(":") : undefined;
    }

    current = current.parentPath;
  }

  // No parent function found, but we might have call segments (unlikely)
  return segments.length > 0 ? segments.join(":") : undefined;
}

/**
 * Extracts function name from AST node.
 * Pure function with no side effects.
 *
 * @param path - Babel AST path
 * @param parentName - Optional parent function name for nested functions
 * @returns Function name or 'anonymous', prefixed with parent name if nested
 */
export function getFunctionName(
  path:
    | NodePath<t.FunctionDeclaration>
    | NodePath<t.FunctionExpression>
    | NodePath<t.ArrowFunctionExpression>
    | NodePath<t.ObjectMethod>
    | NodePath<t.ClassMethod>,
  parentName?: string
): string {
  const node = path.node;

  // Named function declaration
  if (t.isFunctionDeclaration(node) && node.id) {
    const name = node.id.name;
    return parentName ? `${parentName}:${name}` : name;
  }

  // Class method
  if (t.isClassMethod(node) && t.isIdentifier(node.key)) {
    const name = node.key.name;
    return parentName ? `${parentName}:${name}` : name;
  }

  // Object method
  if (t.isObjectMethod(node) && t.isIdentifier(node.key)) {
    const name = node.key.name;
    return parentName ? `${parentName}:${name}` : name;
  }

  // Variable assignment: const foo = function() {}
  if (
    (t.isFunctionExpression(node) || t.isArrowFunctionExpression(node)) &&
    t.isVariableDeclarator(path.parent) &&
    t.isIdentifier(path.parent.id)
  ) {
    const name = path.parent.id.name;
    return parentName ? `${parentName}:${name}` : name;
  }

  // Property assignment: obj.foo = function() {}
  if (
    (t.isFunctionExpression(node) || t.isArrowFunctionExpression(node)) &&
    t.isAssignmentExpression(path.parent) &&
    t.isMemberExpression(path.parent.left) &&
    t.isIdentifier(path.parent.left.property)
  ) {
    const name = path.parent.left.property.name;
    return parentName ? `${parentName}:${name}` : name;
  }

  // Default to anonymous
  const baseName = "anonymous";
  return parentName ? `${parentName}:${baseName}` : baseName;
}
