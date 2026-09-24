import type { NodePath } from "@babel/traverse";
import type {
  FunctionDeclaration,
  FunctionExpression,
  ArrowFunctionExpression,
  ObjectMethod,
  ClassMethod,
} from "@babel/types";

/** The explicit union of function-like NodePath types. */
export type FunctionLikePath =
  | NodePath<FunctionDeclaration>
  | NodePath<FunctionExpression>
  | NodePath<ArrowFunctionExpression>
  | NodePath<ObjectMethod>
  | NodePath<ClassMethod>;
