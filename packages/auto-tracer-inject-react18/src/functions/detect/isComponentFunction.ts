import * as t from "@babel/types";
import type { NodePath } from "@babel/traverse";
import { returnsJSX } from "./helpers/returnsJSX.js";
import { hasJSXInBody } from "./helpers/hasJSXInBody.js";
import { callsReactHooks } from "./helpers/callsReactHooks.js";
import { isInNonComponentContext } from "./helpers/isInNonComponentContext.js";
import { isPascalCase } from "./helpers/isPascalCase.js";
import { extractFunctionName } from "./helpers/extractFunctionName.js";
import { isCustomHookName } from "./helpers/isCustomHookName.js";
import { isJSXFactorySignature } from "./helpers/isJSXFactorySignature.js";

/**
 * isComponentFunction
 *
 * Determines if the provided AST node represents a React component function using
 * a multi-layer defense strategy to minimize false positives.
 *
 * **Detection Strategy (3 layers):**
 *
 * 1. **Rejection Layer** - Explicitly reject known non-components:
 *    - Functions passed to `lazy()`, `then()`, `map()`, etc.
 *    - All async functions (hooks cannot be used in async functions)
 *    - JSX factory functions (multi-param or value-typed single-param)
 *    - Custom hooks (functions named with `useSomething` pattern)
 *    - Non-PascalCase names
 *
 * 2. **Signal Layer** - Require at least one strong component signal:
 *    - Returns JSX elements/fragments
 *    - Calls React hooks (useState, useEffect, custom hooks)
 *    - Contains JSX anywhere in body (excluding nested functions)
 *
 * 3. **Validation Layer** - Apply heuristics:
 *    - PascalCase naming convention
 *    - Top-level declarations (nested functions and callback contexts rejected)
 *
 * **Supported Patterns:**
 * - Function declarations: `function MyComponent() { return <div />; }`
 * - Arrow functions: `const MyComponent = () => <div />;`
 * - Function expressions: `const MyComponent = function() { return <div />; };`
 *
 * **Rejected Patterns:**
 * - `lazy(() => import('./Component'))` - Module loader
 * - `promise.then(() => ...)` - Promise callback
 * - `array.map(Item => <Item />)` - Array iterator
 * - `async function Component() { ... }` - All async functions (hooks cannot be used in async)
 * - `const Helper = (msg, text, onClick) => <JSX />` - JSX factory (3+ params)
 * - `const TagB2 = (msg, linkText) => <Link />` - JSX factory (2 non-destructured params)
 *
 * @param node - The AST node to analyze
 * @param path - Optional Babel NodePath for context analysis (recommended)
 * @param hookPattern - Optional regex pattern to match custom hook naming
 * @returns True if node is determined to be a React component, false otherwise
 *
 * @example
 * ```typescript
 * // Component - has JSX + PascalCase
 * function Button() { return <button />; } // ✅ true
 *
 * // Component - calls hooks + PascalCase
 * const Form = () => { useState(0); return null; }; // ✅ true
 *
 * // Component - destructured props
 * const Card = ({ title, children }) => <div>{title}{children}</div>; // ✅ true
 *
 * // NOT directly detected - raw 2-param signature (detected via HOC wrapper path)
 * const Input = (props, ref) => <input ref={ref} />; // ❌ false
 *
 * // Component - detected through HOC wrapper path
 * const Input = forwardRef((props, ref) => <input ref={ref} />); // ✅ true
 *
 * // NOT a component - lazy loader
 * const Lazy = lazy(() => import('./Comp')); // ❌ false
 *
 * // NOT a component - camelCase utility
 * const parseJSON = (str) => JSON.parse(str); // ❌ false
 *
 * // NOT a component - JSX factory (2+ simple params)
 * const TagB2 = (msg, linkText) => <Link>{msg}</Link>; // ❌ false
 *
 * // NOT a component - JSX factory (3+ params)
 * const Helper = (title, onClick, disabled) => <Button />; // ❌ false
 * ```
 */
export function isComponentFunction(
  node: t.Node,
  path?: NodePath,
  hookPattern?: RegExp,
): boolean {
  // === LAYER 1: REJECTION ===

  // Reject: Functions in non-component contexts (lazy, then, map, etc.)
  if (path && isInNonComponentContext(path)) {
    return false;
  }

  // === LAYER 2 & 3: VALIDATION + SIGNAL DETECTION ===

  // Function declarations
  if (t.isFunctionDeclaration(node) && node.id) {
    // Reject: Async functions are never components (data loaders, initialization, etc.)
    if (node.async) {
      return false;
    }

    // Reject: JSX factory functions (not components)
    if (isJSXFactorySignature(node)) {
      return false;
    }

    // Check for component signals
    const hasJSX = returnsJSX(node) || hasJSXInBody(node);
    const hasHooks = callsReactHooks(node, hookPattern);

    // Require at least one signal
    if (!hasJSX && !hasHooks) {
      return false;
    }

    // Layer 3: PascalCase validation
    const name = extractFunctionName(node);
    if (!name) {
      // Fail closed: reject if name extraction unexpectedly fails
      return false;
    }

    // Reject: Custom hooks are not components (even though they call hooks)
    // Custom hooks follow "useSomething" naming convention
    if (isCustomHookName(name)) {
      return false;
    }

    // Require PascalCase naming for all components (with or without hooks)
    // This prevents malformed/badly-named functions from being instrumented
    return isPascalCase(name);
  }

  // Variable declarators with function expressions
  if (t.isVariableDeclarator(node) && node.id && t.isIdentifier(node.id)) {
    const init = node.init;

    // Must be a function expression or arrow function
    if (!t.isFunctionExpression(init) && !t.isArrowFunctionExpression(init)) {
      return false;
    }

    // Reject: Async functions are never components (data loaders, initialization, etc.)
    if (init.async) {
      return false;
    }

    // Reject: JSX factory functions (not components)
    if (isJSXFactorySignature(init)) {
      return false;
    }

    // Check for component signals
    const hasJSX = returnsJSX(init) || hasJSXInBody(init);
    const hasHooks = callsReactHooks(init, hookPattern);

    // Require at least one signal
    if (!hasJSX && !hasHooks) {
      return false;
    }

    // Layer 3: PascalCase validation
    const name = extractFunctionName(node);
    if (!name) {
      // Fail closed: reject if name extraction unexpectedly fails
      return false;
    }

    // Reject: Custom hooks are not components (even though they call hooks)
    // Custom hooks follow "useSomething" naming convention
    if (isCustomHookName(name)) {
      return false;
    }

    // Require PascalCase naming for all components (with or without hooks)
    // This prevents malformed/badly-named functions from being instrumented
    return isPascalCase(name);
  }

  // Bare function expressions or arrow functions
  if (t.isFunctionExpression(node) || t.isArrowFunctionExpression(node)) {
    // SAFEST APPROACH: Reject all bare anonymous functions by default
    // Only accept them when proven by HOC context in transform.ts
    // This prevents:
    // - Self-validation (instrumented code re-validating itself)
    // - False positives from non-React "use" prefix functions
    // - Arbitrary factory callbacks with JSX
    // - Transform pollution creating false signals
    return false;
  }

  return false;
}
