import { describe, it, expect } from "vitest";
import { transformSync } from "@babel/core";
import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { getEffectiveCommentHost } from "../../src/getEffectiveCommentHost";

/**
 * Parses `code` via a capturing Babel plugin and returns the host node
 * that `getEffectiveCommentHost` resolves for the first function-like node found.
 */
const captureHost = (code: string): t.Node => {
  let captured: t.Node | undefined;
  transformSync(code, {
    plugins: [
      () => ({
        visitor: {
          FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) { if (captured === undefined) captured = getEffectiveCommentHost(path); },
          FunctionExpression(path: NodePath<t.FunctionExpression>) { if (captured === undefined) captured = getEffectiveCommentHost(path); },
          ArrowFunctionExpression(path: NodePath<t.ArrowFunctionExpression>) { if (captured === undefined) captured = getEffectiveCommentHost(path); },
          ObjectMethod(path: NodePath<t.ObjectMethod>) { if (captured === undefined) captured = getEffectiveCommentHost(path); },
          ClassMethod(path: NodePath<t.ClassMethod>) { if (captured === undefined) captured = getEffectiveCommentHost(path); },
        },
      }),
    ],
    filename: "test.ts",
    configFile: false,
    babelrc: false,
  });
  if (captured === undefined) throw new Error("No function-like node found in test code");
  return captured;
};

describe("getEffectiveCommentHost", () => {
  describe("export wrappers — comments live on the declaration node", () => {
    it("returns ExportNamedDeclaration for named export function", () => {
      const host = captureHost(`export function foo() {}`);
      expect(t.isExportNamedDeclaration(host)).toBe(true);
    });

    it("returns ExportDefaultDeclaration for default export function", () => {
      const host = captureHost(`export default function foo() {}`);
      expect(t.isExportDefaultDeclaration(host)).toBe(true);
    });

    it("returns ExportNamedDeclaration for export const arrow", () => {
      const host = captureHost(`export const foo = () => {};`);
      expect(t.isExportNamedDeclaration(host)).toBe(true);
    });
  });

  describe("variable declarations — comments live on the VariableDeclaration", () => {
    it("returns VariableDeclaration for const function expression", () => {
      const host = captureHost(`const foo = function() {};`);
      expect(t.isVariableDeclaration(host)).toBe(true);
    });

    it("returns VariableDeclaration for const arrow function", () => {
      const host = captureHost(`const foo = () => {};`);
      expect(t.isVariableDeclaration(host)).toBe(true);
    });
  });

  describe("assignment expressions — comments live on the ExpressionStatement", () => {
    it("returns ExpressionStatement for property assignment", () => {
      const host = captureHost(`obj.foo = function() {};`);
      expect(t.isExpressionStatement(host)).toBe(true);
    });
  });

  describe("call expressions — comments live on the ExpressionStatement", () => {
    it("returns ExpressionStatement for call-argument callback as a bare statement", () => {
      const host = captureHost(`setTimeout(function() {}, 100);`);
      expect(t.isExpressionStatement(host)).toBe(true);
    });

    it("returns the FunctionExpression itself when call is inside a variable declaration", () => {
      // parent chain: FunctionExpression → CallExpression → VariableDeclarator (not ExpressionStatement)
      const host = captureHost(`const id = setTimeout(function() {}, 100);`);
      expect(t.isFunctionExpression(host)).toBe(true);
    });
  });

  describe("fallthrough — comments live on the function node itself", () => {
    it("returns FunctionDeclaration for a plain function declaration", () => {
      const host = captureHost(`function foo() {}`);
      expect(t.isFunctionDeclaration(host)).toBe(true);
    });

    it("returns ObjectMethod for an object method", () => {
      const host = captureHost(`const obj = { myMethod() {} };`);
      expect(t.isObjectMethod(host)).toBe(true);
    });

    it("returns ClassMethod for a class method", () => {
      const host = captureHost(`class Foo { myMethod() {} }`);
      expect(t.isClassMethod(host)).toBe(true);
    });
  });
});
