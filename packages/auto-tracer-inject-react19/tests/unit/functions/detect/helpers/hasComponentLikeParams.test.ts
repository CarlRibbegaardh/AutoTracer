import { describe, it, expect } from "vitest";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { hasComponentLikeParams } from "../../../../../src/functions/detect/helpers/hasComponentLikeParams";

/**
 * Test helper: Parse TypeScript code and extract the first function node
 */
function parseFunction(code: string): t.Function {
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });

  let func: t.Function | null = null;

  traverse(ast, {
    Function(path) {
      if (!func) {
        func = path.node;
      }
      path.stop();
    },
  });

  if (!func) {
    throw new Error(`No function found in code: ${code}`);
  }

  return func;
}

describe("hasComponentLikeParams", () => {
  describe("accepts component patterns", () => {
    it("accepts 0 parameters", () => {
      const func = parseFunction("() => <div />");
      expect(hasComponentLikeParams(func)).toBe(true);
    });

    it("accepts single parameter with no type annotation", () => {
      const func = parseFunction("(props) => <div />");
      expect(hasComponentLikeParams(func)).toBe(true);
    });

    it("accepts single parameter with object type", () => {
      const func = parseFunction("(props: Props) => <div />");
      expect(hasComponentLikeParams(func)).toBe(true);
    });

    it("accepts single parameter with interface type", () => {
      const func = parseFunction("(props: ButtonProps) => <div />");
      expect(hasComponentLikeParams(func)).toBe(true);
    });

    it("accepts destructured object props", () => {
      const func = parseFunction("({ title, children }) => <div />");
      expect(hasComponentLikeParams(func)).toBe(true);
    });

    it("accepts parameter with default value", () => {
      const func = parseFunction("(props = {}) => <div />");
      expect(hasComponentLikeParams(func)).toBe(true);
    });

    it("accepts destructured props with default value", () => {
      const func = parseFunction("({ title = 'default' }) => <div />");
      expect(hasComponentLikeParams(func)).toBe(true);
    });

    it("accepts single parameter with union type containing object", () => {
      const func = parseFunction("(props: Props | OtherProps) => <div />");
      expect(hasComponentLikeParams(func)).toBe(true);
    });

    it("accepts single parameter with complex generic type", () => {
      const func = parseFunction("(props: Readonly<Props>) => <div />");
      expect(hasComponentLikeParams(func)).toBe(true);
    });
  });

  describe("rejects factory patterns", () => {
    it("rejects single parameter with string type", () => {
      const func = parseFunction("(msg: string) => <span />");
      expect(hasComponentLikeParams(func)).toBe(false);
    });

    it("rejects single parameter with number type", () => {
      const func = parseFunction("(count: number) => <span />");
      expect(hasComponentLikeParams(func)).toBe(false);
    });

    it("rejects single parameter with boolean type", () => {
      const func = parseFunction("(isActive: boolean) => <span />");
      expect(hasComponentLikeParams(func)).toBe(false);
    });

    it("rejects single parameter with ReactNode type", () => {
      const func = parseFunction("(content: ReactNode) => <div />");
      expect(hasComponentLikeParams(func)).toBe(false);
    });

    it("rejects single parameter with React.ReactNode type", () => {
      const func = parseFunction("(content: React.ReactNode) => <div />");
      expect(hasComponentLikeParams(func)).toBe(false);
    });

    it("rejects single parameter with ReactElement type", () => {
      const func = parseFunction("(element: ReactElement) => <div />");
      expect(hasComponentLikeParams(func)).toBe(false);
    });

    it("rejects single parameter with React.ReactElement type", () => {
      const func = parseFunction("(element: React.ReactElement) => <div />");
      expect(hasComponentLikeParams(func)).toBe(false);
    });

    it("rejects single parameter with JSX.Element type", () => {
      const func = parseFunction("(content: JSX.Element) => <div />");
      expect(hasComponentLikeParams(func)).toBe(false);
    });

    it("rejects single parameter with React.JSX.Element type", () => {
      const func = parseFunction("(content: React.JSX.Element) => <div />");
      expect(hasComponentLikeParams(func)).toBe(false);
    });

    it("rejects single parameter with null type", () => {
      const func = parseFunction("(value: null) => <div />");
      expect(hasComponentLikeParams(func)).toBe(false);
    });

    it("rejects single parameter with undefined type", () => {
      const func = parseFunction("(value: undefined) => <div />");
      expect(hasComponentLikeParams(func)).toBe(false);
    });

    it("rejects single parameter with bigint type", () => {
      const func = parseFunction("(id: bigint) => <div />");
      expect(hasComponentLikeParams(func)).toBe(false);
    });

    it("rejects single parameter with symbol type", () => {
      const func = parseFunction("(key: symbol) => <div />");
      expect(hasComponentLikeParams(func)).toBe(false);
    });

    it("rejects array destructuring pattern", () => {
      const func = parseFunction("([a, b]) => <div />");
      expect(hasComponentLikeParams(func)).toBe(false);
    });

    it("rejects default parameter with string type", () => {
      const func = parseFunction("(msg: string = 'hello') => <div />");
      expect(hasComponentLikeParams(func)).toBe(false);
    });

    it("rejects default parameter with number type", () => {
      const func = parseFunction("(count: number = 0) => <div />");
      expect(hasComponentLikeParams(func)).toBe(false);
    });

    it("rejects default parameter with ReactNode type", () => {
      const func = parseFunction("(content: ReactNode = null) => <div />");
      expect(hasComponentLikeParams(func)).toBe(false);
    });

    it("rejects union of all primitive types", () => {
      const func = parseFunction("(value: string | number) => <div />");
      expect(hasComponentLikeParams(func)).toBe(false);
    });

    it("rejects union of primitive and ReactNode", () => {
      const func = parseFunction("(msg: React.ReactNode | string) => <div />");
      expect(hasComponentLikeParams(func)).toBe(false);
    });

    it("rejects union of primitives with null", () => {
      const func = parseFunction("(value: string | null) => <div />");
      expect(hasComponentLikeParams(func)).toBe(false);
    });

    it("accepts union with non-value object type", () => {
      const func = parseFunction("(props: Props | null) => <div />");
      expect(hasComponentLikeParams(func)).toBe(true);
    });

    it("accepts union of object types", () => {
      const func = parseFunction("(props: PropsA | PropsB) => <div />");
      expect(hasComponentLikeParams(func)).toBe(true);
    });
  });

  describe("handles edge cases", () => {
    it("returns false for 2+ parameters (handled by caller)", () => {
      const func = parseFunction("(msg, text) => <div />");
      expect(hasComponentLikeParams(func)).toBe(false);
    });

    it("returns false for non-identifier first parameter", () => {
      const func = parseFunction("(...rest) => <div />");
      expect(hasComponentLikeParams(func)).toBe(false);
    });
  });
});
