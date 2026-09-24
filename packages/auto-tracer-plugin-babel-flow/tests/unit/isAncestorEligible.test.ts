import { describe, it, expect } from "vitest";
import { transformSync } from "@babel/core";
import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { isAncestorEligible } from "../../src/isAncestorEligible";
import { DEFAULT_CONFIG } from "../../src/types/index";
import type { NormalizedBabelPluginFlowConfig } from "../../src/types/index";

/**
 * Parses `code` and returns `isAncestorEligible` applied to the
 * `FunctionDeclaration` whose name matches `targetName`.
 */
const captureEligibility = (
  code: string,
  targetName: string,
  config: NormalizedBabelPluginFlowConfig = DEFAULT_CONFIG,
): boolean => {
  let result: boolean | undefined;
  transformSync(code, {
    plugins: [
      () => ({
        visitor: {
          FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
            if (path.node.id?.name === targetName) {
              result = isAncestorEligible(path, config);
            }
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

describe("isAncestorEligible", () => {
  it("returns true for a function that passes default config filters", () => {
    expect(captureEligibility(`function foo() {}`, "foo")).toBe(true);
  });

  it("returns false when the function name is excluded", () => {
    const config: NormalizedBabelPluginFlowConfig = {
      ...DEFAULT_CONFIG,
      exclude: { functions: ["foo"] },
    };
    expect(captureEligibility(`function foo() {}`, "foo", config)).toBe(false);
  });

  it("returns false when the function name is not in the include list", () => {
    const config: NormalizedBabelPluginFlowConfig = {
      ...DEFAULT_CONFIG,
      include: { functions: ["bar"] },
    };
    expect(captureEligibility(`function foo() {}`, "foo", config)).toBe(false);
  });

  it("returns true when the function name is explicitly in the include list", () => {
    const config: NormalizedBabelPluginFlowConfig = {
      ...DEFAULT_CONFIG,
      include: { functions: ["foo"] },
    };
    expect(captureEligibility(`function foo() {}`, "foo", config)).toBe(true);
  });
});
