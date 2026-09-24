import { describe, it, expect } from "vitest";
import { transformSync } from "@babel/core";
import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { getEffectiveFunctionPragmas } from "../../src/getEffectiveFunctionPragmas";
import { DEFAULT_CONFIG } from "../../src/types/index";
import type { NormalizedBabelPluginFlowConfig } from "../../src/types/index";
import type { PragmaResult } from "@autotracer/filter-utils";
import { isFunctionLikePath } from "../../src/isFunctionLikePath";

/**
 * Parses `code` and returns the effective pragma result for the
 * `FunctionDeclaration` whose name matches `targetName`.
 */
const captureEffectivePragmas = (
  code: string,
  targetName: string,
  config: NormalizedBabelPluginFlowConfig = DEFAULT_CONFIG,
): PragmaResult => {
  let result: PragmaResult | undefined;
  transformSync(code, {
    plugins: [
      () => ({
        visitor: {
          FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
            if (path.node.id?.name === targetName && isFunctionLikePath(path)) {
              result = getEffectiveFunctionPragmas(path, config);
            }
          },
        },
      }),
    ],
    filename: "test.ts",
    configFile: false,
    babelrc: false,
  });
  return result ?? { hasTrace: false, hasDisable: false };
};

describe("getEffectiveFunctionPragmas", () => {
  describe("local pragma wins", () => {
    it("returns hasDisable=true, hasTrace=false for local @trace-disable", () => {
      const code = `
        // @trace-disable
        function foo() {}
      `;
      const result = captureEffectivePragmas(code, "foo");
      expect(result.hasDisable).toBe(true);
      expect(result.hasTrace).toBe(false);
    });

    it("returns hasTrace=true for local @trace", () => {
      const code = `
        // @trace
        function foo() {}
      `;
      const result = captureEffectivePragmas(code, "foo");
      expect(result.hasTrace).toBe(true);
      expect(result.hasDisable).toBe(false);
    });
  });

  describe("ancestor pragma inheritance", () => {
    it("inherits hasTrace=true from eligible ancestor", () => {
      const code = `
        // @trace
        function outer() {
          function inner() {}
        }
      `;
      const result = captureEffectivePragmas(code, "inner");
      expect(result.hasTrace).toBe(true);
      expect(result.hasDisable).toBe(false);
    });

    it("local @trace-disable overrides ancestor @trace (disable cascades)", () => {
      const code = `
        // @trace
        function outer() {
          // @trace-disable
          function inner() {}
        }
      `;
      const result = captureEffectivePragmas(code, "inner");
      expect(result.hasDisable).toBe(true);
      expect(result.hasTrace).toBe(false);
    });

    it("ancestor @trace-disable overrides local @trace", () => {
      const code = `
        // @trace-disable
        function outer() {
          // @trace
          function inner() {}
        }
      `;
      const result = captureEffectivePragmas(code, "inner");
      expect(result.hasDisable).toBe(true);
      expect(result.hasTrace).toBe(false);
    });
  });

  describe("no pragmas", () => {
    it("returns false/false when neither node nor ancestors have pragmas", () => {
      const code = `function foo() {}`;
      const result = captureEffectivePragmas(code, "foo");
      expect(result).toEqual({ hasTrace: false, hasDisable: false });
    });
  });
});
