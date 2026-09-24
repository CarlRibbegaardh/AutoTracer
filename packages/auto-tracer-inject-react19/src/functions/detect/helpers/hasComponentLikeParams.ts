import * as t from "@babel/types";

/**
 * Checks if a function's parameter signature suggests it accepts component-like props
 * rather than individual primitive values (JSX factory pattern).
 *
 * This uses TypeScript type annotations when available to distinguish:
 * - Component: `(props: Props) => <div />`
 * - Factory: `(msg: string, text: string) => <div />`
 *
 * **Returns true (component-like) when:**
 * - 0 parameters
 * - 1 destructured parameter: `({ name, age }) => ...`
 * - 1 parameter with default and object type: `(props: Props = {}) => ...`
 * - 1 parameter with no type annotation (ambiguous, allow)
 * - 1 parameter with object/complex type annotation
 * - 1 parameter with union type containing non-value types: `(props: Props | null) => ...`
 *
 * **Returns false (factory-like) when:**
 * - Multiple parameters (handled by caller)
 * - 1 parameter with primitive type: `(msg: string) => ...`
 * - 1 parameter with value type: `(content: ReactNode) => ...`
 * - 1 parameter with union of all value types: `(msg: string | number) => ...`
 * - Array destructuring: `([a, b]) => ...`
 *
 * @param func - The function AST node to analyze
 * @returns True if parameters suggest component, false if they suggest factory
 *
 * @example
 * ```typescript
 * // Component-like - returns true
 * (props: Props) => <div />
 * ({ name, age }) => <div />
 * (props = {}) => <div />
 * (props: Props | null) => <div />
 *
 * // Factory-like - returns false
 * (msg: string) => <div />
 * (content: ReactNode) => <div />
 * (value: string | number) => <div />
 * ([a, b]) => <div />
 * ```
 *
 * @internal
 */
export function hasComponentLikeParams(func: t.Function): boolean {
  const params = func.params;

  // 0 parameters - component (render nothing)
  if (params.length === 0) {
    return true;
  }

  // Multiple parameters handled by caller (isJSXFactorySignature)
  if (params.length > 1) {
    return false;
  }

  const [param] = params;

  // Destructured object props: ({ foo }) => ...
  if (t.isObjectPattern(param)) {
    return true;
  }

  // Array destructuring is NOT component-like (normal function API, not props)
  if (t.isArrayPattern(param)) {
    return false;
  }

  // Defaulted param: analyze the type of the left-hand side
  if (t.isAssignmentPattern(param)) {
    const left = param.left;

    // Destructured object with default: ({ props } = {}) => ...
    if (t.isObjectPattern(left)) {
      return true;
    }

    // Simple identifier with default: need to check type annotation
    if (t.isIdentifier(left)) {
      // Fall through to identifier analysis below
      // We'll analyze the typeAnnotation on the left side
      return analyzeIdentifierType(left);
    }

    return false;
  }

  if (!t.isIdentifier(param)) {
    return false;
  }

  return analyzeIdentifierType(param);
}

/**
 * Analyzes whether an identifier parameter's type annotation suggests
 * a component props parameter or a factory value parameter.
 *
 * @param param - The identifier parameter node to analyze
 * @returns True if component-like, false if factory-like
 * @internal
 */
function analyzeIdentifierType(param: t.Identifier): boolean {

  // No annotation: ambiguous, but allow (could be props object)
  if (!param.typeAnnotation || !t.isTSTypeAnnotation(param.typeAnnotation)) {
    return true;
  }

  const typeNode = param.typeAnnotation.typeAnnotation;

  // Reject obvious primitive value types
  if (
    t.isTSStringKeyword(typeNode) ||
    t.isTSNumberKeyword(typeNode) ||
    t.isTSBooleanKeyword(typeNode) ||
    t.isTSBigIntKeyword(typeNode) ||
    t.isTSSymbolKeyword(typeNode) ||
    t.isTSNullKeyword(typeNode) ||
    t.isTSUndefinedKeyword(typeNode)
  ) {
    return false;
  }

  // Reject union types where all members are value-like
  if (t.isTSUnionType(typeNode)) {
    // If every union member is a value type, reject
    const allMembersAreValueTypes = typeNode.types.every((memberType) =>
      isValueLikeType(memberType),
    );
    if (allMembersAreValueTypes) {
      return false;
    }
    // If union contains mix of value and object types, treat as ambiguous (allow)
    return true;
  }

  // Reject React.ReactNode / ReactNode / JSX.Element / ReactElement (value types)
  if (t.isTSTypeReference(typeNode)) {
    const typeName = typeNode.typeName;

    if (t.isIdentifier(typeName)) {
      if (
        typeName.name === "ReactNode" ||
        typeName.name === "ReactElement"
      ) {
        return false;
      }
    }

    // Two-level qualified names: React.ReactNode, React.ReactElement, JSX.Element
    if (
      t.isTSQualifiedName(typeName) &&
      t.isIdentifier(typeName.left) &&
      t.isIdentifier(typeName.right)
    ) {
      if (
        typeName.left.name === "React" &&
        (typeName.right.name === "ReactNode" ||
          typeName.right.name === "ReactElement")
      ) {
        return false;
      }
      if (typeName.left.name === "JSX" && typeName.right.name === "Element") {
        return false;
      }
    }

    // Three-level qualified names: React.JSX.Element
    if (
      t.isTSQualifiedName(typeName) &&
      t.isTSQualifiedName(typeName.left) &&
      t.isIdentifier(typeName.left.left) &&
      t.isIdentifier(typeName.left.right) &&
      t.isIdentifier(typeName.right)
    ) {
      if (
        typeName.left.left.name === "React" &&
        typeName.left.right.name === "JSX" &&
        typeName.right.name === "Element"
      ) {
        return false;
      }
    }
  }

  // Identifier param with non-primitive type: treat as possible props object
  return true;
}

/**
 * Checks if a TypeScript type node represents a value-like type
 * (primitive or React value type) rather than a props object type.
 *
 * Detects:
 * - Primitives: string, number, boolean, bigint, symbol, null, undefined
 * - React value types: ReactNode, ReactElement, React.ReactNode, React.ReactElement
 * - JSX types: JSX.Element, React.JSX.Element
 *
 * @param typeNode - The TypeScript type AST node to analyze
 * @returns True if the type is value-like, false otherwise
 * @internal
 */
function isValueLikeType(typeNode: t.TSType): boolean {
  // Primitive types
  if (
    t.isTSStringKeyword(typeNode) ||
    t.isTSNumberKeyword(typeNode) ||
    t.isTSBooleanKeyword(typeNode) ||
    t.isTSBigIntKeyword(typeNode) ||
    t.isTSSymbolKeyword(typeNode) ||
    t.isTSNullKeyword(typeNode) ||
    t.isTSUndefinedKeyword(typeNode)
  ) {
    return true;
  }

  // React value types
  if (t.isTSTypeReference(typeNode)) {
    const typeName = typeNode.typeName;

    if (t.isIdentifier(typeName)) {
      if (
        typeName.name === "ReactNode" ||
        typeName.name === "ReactElement"
      ) {
        return true;
      }
    }

    // Two-level qualified names: React.ReactNode, React.ReactElement, JSX.Element
    if (
      t.isTSQualifiedName(typeName) &&
      t.isIdentifier(typeName.left) &&
      t.isIdentifier(typeName.right)
    ) {
      if (
        typeName.left.name === "React" &&
        (typeName.right.name === "ReactNode" ||
          typeName.right.name === "ReactElement")
      ) {
        return true;
      }
      if (typeName.left.name === "JSX" && typeName.right.name === "Element") {
        return true;
      }
    }

    // Three-level qualified names: React.JSX.Element
    if (
      t.isTSQualifiedName(typeName) &&
      t.isTSQualifiedName(typeName.left) &&
      t.isIdentifier(typeName.left.left) &&
      t.isIdentifier(typeName.left.right) &&
      t.isIdentifier(typeName.right)
    ) {
      if (
        typeName.left.left.name === "React" &&
        typeName.left.right.name === "JSX" &&
        typeName.right.name === "Element"
      ) {
        return true;
      }
    }
  }

  return false;
}
