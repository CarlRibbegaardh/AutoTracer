import { describe, it, expect } from "vitest";
import type { BabelFlowModule } from "../../src/BabelFlowModule";
import type babelFlowDefault from "@autotracer/plugin-babel-flow";
import type {
  normalizeConfig,
  shouldProcessFile,
} from "@autotracer/plugin-babel-flow";

describe("BabelFlowModule", () => {
  it("is a type-only export — not a runtime value", async () => {
    const mod = await import("../../src/BabelFlowModule.js");
    expect((mod as Record<string, unknown>).BabelFlowModule).toBeUndefined();
  });
});

// Compile-time drift guard: BabelFlowModule must stay in sync with the public
// exports of @autotracer/plugin-babel-flow. Both directions are checked:
//   _G1 fails if BabelFlowModule drops a member the package exports.
//   _G2 fails if BabelFlowModule adds a member the package does not export.
type _ActualBabelFlowExports = {
  readonly default: typeof babelFlowDefault;
  readonly normalizeConfig: typeof normalizeConfig;
  readonly shouldProcessFile: typeof shouldProcessFile;
};

type _AssertExtends<T extends U, U> = void;
type _G1 = _AssertExtends<BabelFlowModule, _ActualBabelFlowExports>;
type _G2 = _AssertExtends<_ActualBabelFlowExports, BabelFlowModule>;
