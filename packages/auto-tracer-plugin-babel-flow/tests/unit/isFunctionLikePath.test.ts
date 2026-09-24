import { describe, it, expect } from "vitest";
import { transformSync } from "@babel/core";
import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { isFunctionLikePath } from "../../src/isFunctionLikePath";

/**
 * Traverses `code` and returns `isFunctionLikePath` applied to the first
 * function-like node encountered (FunctionDeclaration, FunctionExpression,
 * ArrowFunctionExpression, ObjectMethod, or ClassMethod).
 */
const captureFromFunctionLike = (code: string): boolean => {
  let result: boolean | undefined;
  transformSync(code, {
    plugins: [
      () => ({
        visitor: {
          FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
            if (result === undefined) result = isFunctionLikePath(path);
          },
          FunctionExpression(path: NodePath<t.FunctionExpression>) {
            if (result === undefined) result = isFunctionLikePath(path);
          },
          ArrowFunctionExpression(path: NodePath<t.ArrowFunctionExpression>) {
            if (result === undefined) result = isFunctionLikePath(path);
          },
          ObjectMethod(path: NodePath<t.ObjectMethod>) {
            if (result === undefined) result = isFunctionLikePath(path);
          },
          ClassMethod(path: NodePath<t.ClassMethod>) {
            if (result === undefined) result = isFunctionLikePath(path);
          },
        },
      }),
    ],
    filename: "test.ts",
    configFile: false,
    babelrc: false,
  });
  return result ?? false;
};

/**
 * Traverses `code` and returns `isFunctionLikePath` applied to the first
 * VariableDeclarator node encountered.
 */
const captureFromVariableDeclarator = (code: string): boolean => {
  let result: boolean | undefined;
  transformSync(code, {
    plugins: [
      () => ({
        visitor: {
          VariableDeclarator(path: NodePath<t.VariableDeclarator>) {
            if (result === undefined) result = isFunctionLikePath(path);
          },
        },
      }),
    ],
    filename: "test.ts",
    configFile: false,
    babelrc: false,
  });
  return result ?? false;
};

describe("isFunctionLikePath", () => {
  describe("returns true for function-like node types", () => {
    it("returns true for FunctionDeclaration", () => {
      expect(captureFromFunctionLike(`function foo() {}`)).toBe(true);
    });

    it("returns true for FunctionExpression", () => {
      expect(captureFromFunctionLike(`const foo = function() {};`)).toBe(true);
    });

    it("returns true for ArrowFunctionExpression", () => {
      expect(captureFromFunctionLike(`const foo = () => {};`)).toBe(true);
    });

    it("returns true for ObjectMethod", () => {
      expect(captureFromFunctionLike(`const obj = { foo() {} };`)).toBe(true);
    });

    it("returns true for ClassMethod", () => {
      expect(captureFromFunctionLike(`class Foo { bar() {} }`)).toBe(true);
    });
  });

  describe("returns false for non-function-like node types", () => {
    it("returns false for VariableDeclarator", () => {
      expect(captureFromVariableDeclarator(`const x = 1;`)).toBe(false);
    });
  });
});
