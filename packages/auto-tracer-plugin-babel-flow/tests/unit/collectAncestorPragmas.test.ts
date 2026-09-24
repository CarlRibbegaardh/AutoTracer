import { describe, it, expect } from "vitest";
import { transformSync } from "@babel/core";
import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { collectAncestorPragmas } from "../../src/collectAncestorPragmas";
import { DEFAULT_CONFIG } from "../../src/types/index";
import type { NormalizedBabelPluginFlowConfig } from "../../src/types/index";
import type { PragmaResult } from "@autotracer/filter-utils";
import { isFunctionLikePath } from "../../src/isFunctionLikePath";

/**
 * Parses `code` and invokes `collectAncestorPragmas` on the innermost
 * `FunctionDeclaration` whose name matches `targetName`.
 */
const captureAncestorPragmas = (
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
              result = collectAncestorPragmas(path, config);
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

describe("collectAncestorPragmas", () => {
  it("returns empty result when there are no enclosing functions", () => {
    const code = `function inner() {}`;
    const result = captureAncestorPragmas(code, "inner");
    expect(result).toEqual({ hasTrace: false, hasDisable: false });
  });

  it("returns empty result when ancestor function has no pragmas", () => {
    const code = `
      function outer() {
        function inner() {}
      }
    `;
    const result = captureAncestorPragmas(code, "inner");
    expect(result).toEqual({ hasTrace: false, hasDisable: false });
  });

  it("returns hasTrace=true when eligible ancestor has @trace", () => {
    const code = `
      // @trace
      function outer() {
        function inner() {}
      }
    `;
    const result = captureAncestorPragmas(code, "inner");
    expect(result.hasTrace).toBe(true);
    expect(result.hasDisable).toBe(false);
  });

  it("returns hasDisable=true when eligible ancestor has @trace-disable", () => {
    const code = `
      // @trace-disable
      function outer() {
        function inner() {}
      }
    `;
    const result = captureAncestorPragmas(code, "inner");
    expect(result.hasDisable).toBe(true);
  });

  it("ignores pragma on ineligible (excluded) ancestor", () => {
    const config: NormalizedBabelPluginFlowConfig = {
      ...DEFAULT_CONFIG,
      exclude: { functions: ["outer"] },
    };
    const code = `
      // @trace
      function outer() {
        function inner() {}
      }
    `;
    const result = captureAncestorPragmas(code, "inner", config);
    expect(result).toEqual({ hasTrace: false, hasDisable: false });
  });

  it("accumulates pragmas from multiple eligible ancestors", () => {
    const code = `
      // @trace
      function outermost() {
        // @trace-disable
        function outer() {
          function inner() {}
        }
      }
    `;
    const result = captureAncestorPragmas(code, "inner");
    expect(result.hasTrace).toBe(true);
    expect(result.hasDisable).toBe(true);
  });
});
