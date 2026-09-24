import * as t from "@babel/types";
import { hasComponentLikeParams } from "./hasComponentLikeParams.js";

/**
 * Detects whether a function's parameter signature suggests it's a JSX factory
 * function rather than a React component.
 *
 * Uses a two-layer detection strategy:
 * 1. **Arity-based heuristic**: Check parameter count and patterns
 * 2. **Type-based analysis**: When TypeScript annotations exist, analyze parameter types
 *
 * JSX factory functions return JSX but are called as regular functions with
 * individual arguments, not as React components with a props object.
 *
 * **Factory patterns (rejected):**
 * - `(msg, linkText) => <Link />` - 2+ simple parameters
 * - `(title, onClick, disabled) => <Button />` - 3+ parameters
 * - `(msg: string) => <span />` - Single parameter with primitive type
 * - `(content: ReactNode) => <div />` - Single parameter with value type
 * - `(props, ref) => <input />` - Raw 2-param pattern (not wrapped in forwardRef)
 *
 * **Component patterns (accepted):**
 * - `(props) => <div />` - Single parameter (no type or object type)
 * - `(props: Props) => <div />` - Single parameter with object type
 * - `({ title, children }) => <div />` - Destructured object props
 * - `forwardRef((props, ref) => <input />)` - forwardRef-wrapped 2-param (detected via HOC path)
 *
 * @param func - The function AST node to analyze
 * @returns True if the signature suggests a JSX factory, false if it suggests a component
 *
 * @example
 * ```typescript
 * // Factory - returns true
 * const TagB2 = (msg, linkText) => <Link />
 * const Icon = (name: string) => <svg />
 * const Input = (props, ref) => <input />  // raw 2-param, not forwardRef-wrapped
 *
 * // Component - returns false
 * const Card = ({ title }) => <div />
 * const Button = (props: ButtonProps) => <button />
 *
 * // forwardRef-wrapped - handled by HOC detection path (not by this function)
 * const Input = forwardRef((props, ref) => <input />)
 * ```
 *
 * @internal
 */
export function isJSXFactorySignature(func: t.Function): boolean {
  const params = func.params;
  // 3+ parameters is almost certainly a factory function, not a component
  if (params.length >= 3) {
    return true;
  }

  // 2 parameters: check if it's a factory or component with destructured props
  if (params.length === 2) {
    // If either param is destructured object, it's likely a component
    const hasObjectPattern = params.some((p) => t.isObjectPattern(p));
    if (hasObjectPattern) {
      return false; // Component with destructured props
    }

    // Two simple params suggests factory (even if named "ref" - too permissive otherwise)
    return true;
  }

  // Layer 2: Type-based analysis for 0-1 params
  // Check if parameter signature suggests component-like props or factory-like values
  return !hasComponentLikeParams(func);
}
