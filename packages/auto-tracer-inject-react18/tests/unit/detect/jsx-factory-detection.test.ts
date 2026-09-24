import { describe, it, expect } from "vitest";
import * as t from "@babel/types";
import { isComponentFunction } from "../../../src/functions/detect/isComponentFunction";

describe("JSX factory function detection", () => {
  describe("Should REJECT JSX factory functions", () => {
    it("should reject JSX factory with 2 simple parameters", () => {
      // const TagB2 = (msg, linkText) => <Link>{msg}</Link>;
      const node = t.variableDeclarator(
        t.identifier("TagB2"),
        t.arrowFunctionExpression(
          [t.identifier("msg"), t.identifier("linkText")],
          t.jsxElement(
            t.jsxOpeningElement(t.jsxIdentifier("Link"), []),
            t.jsxClosingElement(t.jsxIdentifier("Link")),
            [t.jsxExpressionContainer(t.identifier("msg"))],
          ),
        ),
      );

      const result = isComponentFunction(node);
      expect(result).toBe(false);
    });

    it("should reject JSX factory with 3+ parameters", () => {
      // const Helper = (title, onClick, disabled) => <Button />;
      const node = t.variableDeclarator(
        t.identifier("Helper"),
        t.arrowFunctionExpression(
          [
            t.identifier("title"),
            t.identifier("onClick"),
            t.identifier("disabled"),
          ],
          t.jsxElement(
            t.jsxOpeningElement(t.jsxIdentifier("Button"), []),
            t.jsxClosingElement(t.jsxIdentifier("Button")),
            [],
          ),
        ),
      );

      const result = isComponentFunction(node);
      expect(result).toBe(false);
    });

    it("should reject function declaration factory with multiple params", () => {
      // function CreateElement(tag, content, className) { return <div />; }
      const node = t.functionDeclaration(
        t.identifier("CreateElement"),
        [
          t.identifier("tag"),
          t.identifier("content"),
          t.identifier("className"),
        ],
        t.blockStatement([
          t.returnStatement(
            t.jsxElement(
              t.jsxOpeningElement(t.jsxIdentifier("div"), []),
              t.jsxClosingElement(t.jsxIdentifier("div")),
              [],
            ),
          ),
        ]),
      );

      const result = isComponentFunction(node);
      expect(result).toBe(false);
    });

    it("should reject raw 2-param function even if named like forwardRef", () => {
      // const Input = (props, ref) => <input ref={ref} />;
      // This is NOT a valid component unless wrapped in forwardRef(...)
      const node = t.variableDeclarator(
        t.identifier("Input"),
        t.arrowFunctionExpression(
          [t.identifier("props"), t.identifier("ref")],
          t.jsxElement(
            t.jsxOpeningElement(t.jsxIdentifier("input"), []),
            t.jsxClosingElement(t.jsxIdentifier("input")),
            [],
          ),
        ),
      );

      const result = isComponentFunction(node);
      expect(result).toBe(false);
    });

    it("should reject factory with ref-like second param name", () => {
      // const Helper = (content, innerRef) => <div />;
      // Parameter naming alone is not enough to prove forwardRef context
      const node = t.variableDeclarator(
        t.identifier("Helper"),
        t.arrowFunctionExpression(
          [t.identifier("content"), t.identifier("innerRef")],
          t.jsxElement(
            t.jsxOpeningElement(t.jsxIdentifier("div"), []),
            t.jsxClosingElement(t.jsxIdentifier("div")),
            [],
          ),
        ),
      );

      const result = isComponentFunction(node);
      expect(result).toBe(false);
    });
  });

  describe("Should ACCEPT legitimate components", () => {
    it("should accept component with single props parameter", () => {
      // const Button = (props) => <button />;
      const node = t.variableDeclarator(
        t.identifier("Button"),
        t.arrowFunctionExpression(
          [t.identifier("props")],
          t.jsxElement(
            t.jsxOpeningElement(t.jsxIdentifier("button"), []),
            t.jsxClosingElement(t.jsxIdentifier("button")),
            [],
          ),
        ),
      );

      const result = isComponentFunction(node);
      expect(result).toBe(true);
    });

    it("should accept component with destructured props", () => {
      // const Card = ({ title, children }) => <div />;
      const node = t.variableDeclarator(
        t.identifier("Card"),
        t.arrowFunctionExpression(
          [
            t.objectPattern([
              t.objectProperty(
                t.identifier("title"),
                t.identifier("title"),
                false,
                true,
              ),
              t.objectProperty(
                t.identifier("children"),
                t.identifier("children"),
                false,
                true,
              ),
            ]),
          ],
          t.jsxElement(
            t.jsxOpeningElement(t.jsxIdentifier("div"), []),
            t.jsxClosingElement(t.jsxIdentifier("div")),
            [],
          ),
        ),
      );

      const result = isComponentFunction(node);
      expect(result).toBe(true);
    });

    it("should accept component with destructured props and ref", () => {
      // const Input = ({ value }, ref) => <input />;
      const node = t.variableDeclarator(
        t.identifier("Input"),
        t.arrowFunctionExpression(
          [
            t.objectPattern([
              t.objectProperty(
                t.identifier("value"),
                t.identifier("value"),
                false,
                true,
              ),
            ]),
            t.identifier("ref"),
          ],
          t.jsxElement(
            t.jsxOpeningElement(t.jsxIdentifier("input"), []),
            t.jsxClosingElement(t.jsxIdentifier("input")),
            [],
          ),
        ),
      );

      const result = isComponentFunction(node);
      expect(result).toBe(true);
    });
  });

  describe("Type-based factory detection (TypeScript)", () => {
    it("should reject factory with single primitive type parameter", () => {
      // const Icon = (name: string) => <svg />;
      const param = t.identifier("name");
      param.typeAnnotation = t.tsTypeAnnotation(t.tsStringKeyword());

      const node = t.variableDeclarator(
        t.identifier("Icon"),
        t.arrowFunctionExpression(
          [param],
          t.jsxElement(
            t.jsxOpeningElement(t.jsxIdentifier("svg"), []),
            t.jsxClosingElement(t.jsxIdentifier("svg")),
            [],
          ),
        ),
      );

      const result = isComponentFunction(node);
      expect(result).toBe(false);
    });

    it("should reject factory with ReactNode parameter", () => {
      // const Wrapper = (content: ReactNode) => <div>{content}</div>;
      const param = t.identifier("content");
      param.typeAnnotation = t.tsTypeAnnotation(
        t.tsTypeReference(t.identifier("ReactNode")),
      );

      const node = t.variableDeclarator(
        t.identifier("Wrapper"),
        t.arrowFunctionExpression(
          [param],
          t.jsxElement(
            t.jsxOpeningElement(t.jsxIdentifier("div"), []),
            t.jsxClosingElement(t.jsxIdentifier("div")),
            [],
          ),
        ),
      );

      const result = isComponentFunction(node);
      expect(result).toBe(false);
    });

    it("should reject factory with React.ReactNode parameter", () => {
      // const Container = (children: React.ReactNode) => <div />;
      const param = t.identifier("children");
      param.typeAnnotation = t.tsTypeAnnotation(
        t.tsTypeReference(
          t.tsQualifiedName(
            t.identifier("React"),
            t.identifier("ReactNode"),
          ),
        ),
      );

      const node = t.variableDeclarator(
        t.identifier("Container"),
        t.arrowFunctionExpression(
          [param],
          t.jsxElement(
            t.jsxOpeningElement(t.jsxIdentifier("div"), []),
            t.jsxClosingElement(t.jsxIdentifier("div")),
            [],
          ),
        ),
      );

      const result = isComponentFunction(node);
      expect(result).toBe(false);
    });

    it("should accept component with object type parameter", () => {
      // const Button = (props: ButtonProps) => <button />;
      const param = t.identifier("props");
      param.typeAnnotation = t.tsTypeAnnotation(
        t.tsTypeReference(t.identifier("ButtonProps")),
      );

      const node = t.variableDeclarator(
        t.identifier("Button"),
        t.arrowFunctionExpression(
          [param],
          t.jsxElement(
            t.jsxOpeningElement(t.jsxIdentifier("button"), []),
            t.jsxClosingElement(t.jsxIdentifier("button")),
            [],
          ),
        ),
      );

      const result = isComponentFunction(node);
      expect(result).toBe(true);
    });

    it("should accept component with generic props parameter", () => {
      // const List = (props: ListProps<Item>) => <ul />;
      const param = t.identifier("props");
      param.typeAnnotation = t.tsTypeAnnotation(
        t.tsTypeReference(
          t.identifier("ListProps"),
          t.tsTypeParameterInstantiation([
            t.tsTypeReference(t.identifier("Item")),
          ]),
        ),
      );

      const node = t.variableDeclarator(
        t.identifier("List"),
        t.arrowFunctionExpression(
          [param],
          t.jsxElement(
            t.jsxOpeningElement(t.jsxIdentifier("ul"), []),
            t.jsxClosingElement(t.jsxIdentifier("ul")),
            [],
          ),
        ),
      );

      const result = isComponentFunction(node);
      expect(result).toBe(true);
    });

    it("should reject factory with React.JSX.Element parameter", () => {
      // const Wrapper = (element: React.JSX.Element) => <div>{element}</div>;
      const param = t.identifier("element");

      // Build React.JSX.Element as nested qualified name
      // React.JSX.Element = TSQualifiedName(TSQualifiedName(React, JSX), Element)
      const reactJSXQualified: any = {
        type: "TSQualifiedName",
        left: t.identifier("React"),
        right: t.identifier("JSX"),
      };
      const reactJSXElementQualified: any = {
        type: "TSQualifiedName",
        left: reactJSXQualified,
        right: t.identifier("Element"),
      };

      param.typeAnnotation = t.tsTypeAnnotation(
        t.tsTypeReference(reactJSXElementQualified as any),
      );

      const node = t.variableDeclarator(
        t.identifier("Wrapper"),
        t.arrowFunctionExpression(
          [param],
          t.jsxElement(
            t.jsxOpeningElement(t.jsxIdentifier("div"), []),
            t.jsxClosingElement(t.jsxIdentifier("div")),
            [],
          ),
        ),
      );

      const result = isComponentFunction(node);
      expect(result).toBe(false);
    });
  });
});
