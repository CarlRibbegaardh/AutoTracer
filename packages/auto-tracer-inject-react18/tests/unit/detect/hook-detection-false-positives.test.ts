import { describe, it, expect } from "vitest";
import * as t from "@babel/types";
import { isComponentFunction } from "../../../src/functions/detect/isComponentFunction";

describe("Hook detection false positives - FIXED by strict PascalCase", () => {
  describe("Non-React 'use' functions", () => {
    it("should accept function calling user-defined useState (not from React)", () => {
      const node = t.functionDeclaration(
        t.identifier("myUtility"),
        [],
        t.blockStatement([
          t.variableDeclaration("const", [
            t.variableDeclarator(
              t.identifier("state"),
              t.callExpression(t.identifier("useState"), []),
            ),
          ]),
          t.returnStatement(t.identifier("state")),
        ]),
      );

      // FIXED: Strict PascalCase now rejects camelCase functions
      // Even if they call 'use'-prefixed functions
      const result = isComponentFunction(node);

      console.log("\nUser-defined useState:", result);
      expect(result).toBe(false); // Now correctly rejects
    });

    it("should accept database hook pattern (non-React library)", () => {
      const node = t.functionDeclaration(
        t.identifier("fetchData"),
        [],
        t.blockStatement([
          t.variableDeclaration("const", [
            t.variableDeclarator(
              t.identifier("db"),
              t.callExpression(t.identifier("useDatabase"), []),
            ),
          ]),
          t.returnStatement(
            t.callExpression(
              t.memberExpression(t.identifier("db"), t.identifier("query")),
              [t.stringLiteral("SELECT * FROM users")],
            ),
          ),
        ]),
      );

      // FIXED: Strict PascalCase now rejects camelCase functions
      const result = isComponentFunction(node);

      console.log("\nDatabase useDatabase:", result);
      expect(result).toBe(false); // Now correctly rejects
    });

    it("should accept Angular-style 'use' function (wrong framework)", () => {
      const node = t.functionDeclaration(
        t.identifier("myService"),
        [],
        t.blockStatement([
          t.variableDeclaration("const", [
            t.variableDeclarator(
              t.identifier("http"),
              t.callExpression(t.identifier("useHttp"), []), // Angular or similar
            ),
          ]),
          t.returnStatement(t.identifier("http")),
        ]),
      );

      // FIXED: Strict PascalCase now rejects camelCase functions
      const result = isComponentFunction(node);

      console.log("\nAngular-style useHttp:", result);
      expect(result).toBe(false); // Now correctly rejects
    });
  });

  describe("Shadowed React hooks", () => {
    it("should accept function with shadowed useState in scope", () => {
      // In reality: const useState = () => "not a hook";
      // Then calling useState() is NOT calling React's hook!

      const node = t.functionDeclaration(
        t.identifier("myFunction"),
        [],
        t.blockStatement([
          // Imagine useState is shadowed in outer scope
          t.variableDeclaration("const", [
            t.variableDeclarator(
              t.identifier("data"),
              t.callExpression(t.identifier("useState"), []),
            ),
          ]),
        ]),
      );

      // FIXED: Strict PascalCase now rejects camelCase functions
      const result = isComponentFunction(node);

      console.log("\nShadowed useState:", result);
      expect(result).toBe(false); // Now correctly rejects
    });
  });

  describe("Rules of Hooks violations", () => {
    it("should accept hook in conditional (will crash at runtime)", () => {
      const node = t.functionDeclaration(
        t.identifier("badComponent"),
        [],
        t.blockStatement([
          t.ifStatement(
            t.identifier("condition"),
            t.blockStatement([
              t.expressionStatement(
                t.callExpression(t.identifier("useState"), [
                  t.numericLiteral(0),
                ]),
              ),
            ]),
          ),
        ]),
      );

      // FIXED: Strict PascalCase now rejects camelCase functions
      // (Would crash at runtime anyway due to Rules of Hooks violation)
      const result = isComponentFunction(node);

      console.log("\nConditional hook:", result);
      expect(result).toBe(false); // Now correctly rejects
    });

    it("should accept hook in loop (will crash at runtime)", () => {
      const node = t.functionDeclaration(
        t.identifier("badComponent"),
        [],
        t.blockStatement([
          t.forStatement(
            t.variableDeclaration("let", [
              t.variableDeclarator(t.identifier("i"), t.numericLiteral(0)),
            ]),
            t.binaryExpression("<", t.identifier("i"), t.numericLiteral(10)),
            t.updateExpression("++", t.identifier("i")),
            t.blockStatement([
              t.expressionStatement(
                t.callExpression(t.identifier("useState"), [t.identifier("i")]),
              ),
            ]),
          ),
        ]),
      );

      // FIXED: Strict PascalCase now rejects camelCase functions
      const result = isComponentFunction(node);

      console.log("\nHook in loop:", result);
      expect(result).toBe(false); // Now correctly rejects
    });
  });

  describe("Edge case: legitimate confusion", () => {
    it("should accept custom utility with 'use' prefix (developer convention)", () => {
      // Some teams use "use" prefix for utilities that aren't hooks
      const node = t.functionDeclaration(
        t.identifier("processData"),
        [],
        t.blockStatement([
          t.variableDeclaration("const", [
            t.variableDeclarator(
              t.identifier("result"),
              t.callExpression(t.identifier("useCache"), []), // Might be cache utility, not hook
            ),
          ]),
        ]),
      );

      // FIXED: Strict PascalCase now rejects camelCase functions
      const result = isComponentFunction(node);

      console.log("\nCache utility with 'use' prefix:", result);
      expect(result).toBe(false); // Now correctly rejects
    });
  });
});
