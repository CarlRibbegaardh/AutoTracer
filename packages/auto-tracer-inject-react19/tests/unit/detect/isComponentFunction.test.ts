import { describe, it, expect } from "vitest";
import * as t from "@babel/types";
import { isComponentFunction } from "../../../src/functions/detect/isComponentFunction";

describe("isComponentFunction", () => {
  describe("PascalCase validation", () => {
    it("should reject camelCase function declarations that return JSX", () => {
      const node = t.functionDeclaration(
        t.identifier("transformValidationsToAlerts"), // camelCase
        [],
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
      // JSX-only camelCase functions are NOT components (prevents user's crash)
      expect(isComponentFunction(node)).toBe(false);
    });

    it("should REJECT camelCase functions that call hooks (strict PascalCase)", () => {
      const node = t.functionDeclaration(
        t.identifier("renderHelper"), // camelCase - not a component!
        [],
        t.blockStatement([
          t.expressionStatement(
            t.callExpression(t.identifier("useState"), [t.numericLiteral(0)]),
          ),
          t.returnStatement(
            t.jsxElement(
              t.jsxOpeningElement(t.jsxIdentifier("div"), []),
              t.jsxClosingElement(t.jsxIdentifier("div")),
              [],
            ),
          ),
        ]),
      );
      // Strict PascalCase required for all components (prevents self-validation)
      // Badly-named components should be fixed by developers, not auto-instrumented
      expect(isComponentFunction(node)).toBe(false);
    });

    it("should reject camelCase arrow functions that return JSX", () => {
      const node = t.variableDeclarator(
        t.identifier("myComponent"), // camelCase
        t.arrowFunctionExpression(
          [],
          t.jsxElement(
            t.jsxOpeningElement(t.jsxIdentifier("div"), []),
            t.jsxClosingElement(t.jsxIdentifier("div")),
            [],
          ),
        ),
      );
      // JSX-only camelCase functions are NOT components
      expect(isComponentFunction(node)).toBe(false);
    });

    it("should REJECT camelCase arrow functions that call hooks", () => {
      const node = t.variableDeclarator(
        t.identifier("myHelper"), // camelCase - not a component!
        t.arrowFunctionExpression(
          [],
          t.blockStatement([
            t.expressionStatement(
              t.callExpression(t.identifier("useEffect"), [
                t.arrowFunctionExpression([], t.blockStatement([])),
              ]),
            ),
            t.returnStatement(t.nullLiteral()),
          ]),
        ),
      );
      // Strict PascalCase required for all components (prevents self-validation)
      expect(isComponentFunction(node)).toBe(false);
    });

    it("should REJECT snake_case functions that call hooks (bad naming)", () => {
      const node = t.functionDeclaration(
        t.identifier("fetch_user"), // snake_case - not a component!
        [],
        t.blockStatement([
          t.expressionStatement(
            t.callExpression(t.identifier("useState"), [t.numericLiteral(0)]),
          ),
        ]),
      );
      // Strict PascalCase required for all components (prevents self-validation)
      expect(isComponentFunction(node)).toBe(false);
    });

    it("should accept PascalCase function declarations that return JSX", () => {
      const node = t.functionDeclaration(
        t.identifier("MyComponent"),
        [],
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
      expect(isComponentFunction(node)).toBe(true);
    });

    it("should accept PascalCase arrow functions that call hooks", () => {
      const node = t.variableDeclarator(
        t.identifier("MyComponent"),
        t.arrowFunctionExpression(
          [],
          t.blockStatement([
            t.expressionStatement(
              t.callExpression(t.identifier("useState"), [t.numericLiteral(0)]),
            ),
          ]),
        ),
      );
      expect(isComponentFunction(node)).toBe(true);
    });

    it("should accept single uppercase letter component names", () => {
      const node = t.functionDeclaration(
        t.identifier("A"),
        [],
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
      expect(isComponentFunction(node)).toBe(true);
    });

    it("should accept all-caps component names", () => {
      const node = t.functionDeclaration(
        t.identifier("FAQ"),
        [],
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
      expect(isComponentFunction(node)).toBe(true);
    });

    it("should reject JSX-only utility functions without PascalCase", () => {
      const node = t.functionDeclaration(
        t.identifier("renderHelper"),
        [],
        t.blockStatement([
          t.returnStatement(
            t.jsxElement(
              t.jsxOpeningElement(t.jsxIdentifier("span"), []),
              t.jsxClosingElement(t.jsxIdentifier("span")),
              [],
            ),
          ),
        ]),
      );
      // JSX-only camelCase functions are NOT components
      expect(isComponentFunction(node)).toBe(false);
    });
  });

  describe("Signal detection (JSX and hooks)", () => {
    it("should accept PascalCase functions that return JSX", () => {
      const node = t.functionDeclaration(
        t.identifier("Button"),
        [],
        t.blockStatement([
          t.returnStatement(
            t.jsxElement(
              t.jsxOpeningElement(t.jsxIdentifier("button"), []),
              t.jsxClosingElement(t.jsxIdentifier("button")),
              [],
            ),
          ),
        ]),
      );
      expect(isComponentFunction(node)).toBe(true);
    });

    it("should accept PascalCase functions that call hooks", () => {
      const node = t.functionDeclaration(
        t.identifier("Form"),
        [],
        t.blockStatement([
          t.expressionStatement(
            t.callExpression(t.identifier("useState"), [t.numericLiteral(0)]),
          ),
          t.returnStatement(t.nullLiteral()),
        ]),
      );
      expect(isComponentFunction(node)).toBe(true);
    });

    it("should reject functions with no JSX and no hooks", () => {
      const node = t.functionDeclaration(
        t.identifier("ParseJSON"),
        [],
        t.blockStatement([
          t.returnStatement(
            t.callExpression(
              t.memberExpression(t.identifier("JSON"), t.identifier("parse")),
              [t.identifier("str")],
            ),
          ),
        ]),
      );
      expect(isComponentFunction(node)).toBe(false);
    });
  });

  describe("Non-component context rejection", () => {
    it("should reject async functions without JSX", () => {
      const node = t.functionDeclaration(
        t.identifier("FetchData"),
        [],
        t.blockStatement([]),
        false,
        true, // async
      );
      expect(isComponentFunction(node)).toBe(false);
    });
  });
});
