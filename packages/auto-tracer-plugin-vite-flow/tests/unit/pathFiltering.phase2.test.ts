/**
 * Phase 2 tests: Vite Flow default path exclusion behavior.
 *
 * These tests assert the INTENDED POST-PHASE-2 behavior:
 * - Test/spec files are excluded by default.
 * - dist/build/coverage/tests/ folder files are excluded by default.
 * - Normal source files are still processed.
 * - Object-key merge: providing only exclude.functions retains default exclude.paths.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { flowTracer } from "../../src/index";
import { loadThemeFiles } from "@autotracer/flow/build-utils";

vi.mock("@autotracer/flow/build-utils", () => ({
  loadThemeFiles: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(loadThemeFiles).mockResolvedValue({});
});

function getTransform(plugin: ReturnType<typeof flowTracer>) {
  if (!plugin.transform) throw new Error("Plugin has no transform");
  if (typeof plugin.transform === "function") return plugin.transform;
  if (typeof plugin.transform === "object" && "handler" in plugin.transform)
    return plugin.transform.handler;
  throw new Error("Unexpected transform type");
}

// ---------------------------------------------------------------------------
// Default exclusion of test/spec/build files
// ---------------------------------------------------------------------------

describe("default path exclusion — Phase 2 behavior", () => {
  it("excludes .test. files by default", () => {
    const t = getTransform(flowTracer());
    const result = t.call(
      {} as never,
      "function f(){ return 1; }",
      "/project/src/app.test.ts",
    );
    expect(result).toBeNull();
  });

  it("excludes .spec. files by default", () => {
    const t = getTransform(flowTracer());
    const result = t.call(
      {} as never,
      "function f(){ return 1; }",
      "/project/src/app.spec.ts",
    );
    expect(result).toBeNull();
  });

  it("excludes files inside dist/ by default", () => {
    const t = getTransform(flowTracer());
    const result = t.call(
      {} as never,
      "function f(){ return 1; }",
      "/project/dist/app.js",
    );
    expect(result).toBeNull();
  });

  it("excludes files inside build/ by default", () => {
    const t = getTransform(flowTracer());
    const result = t.call(
      {} as never,
      "function f(){ return 1; }",
      "/project/build/app.js",
    );
    expect(result).toBeNull();
  });

  it("excludes files inside tests/ by default", () => {
    const t = getTransform(flowTracer());
    const result = t.call(
      {} as never,
      "function f(){ return 1; }",
      "/project/tests/app.ts",
    );
    expect(result).toBeNull();
  });

  it("excludes files inside coverage/ by default", () => {
    const t = getTransform(flowTracer());
    const result = t.call(
      {} as never,
      "function f(){ return 1; }",
      "/project/coverage/app.js",
    );
    expect(result).toBeNull();
  });

  it("still processes normal source files with no explicit config", () => {
    const t = getTransform(flowTracer());
    const result = t.call(
      {} as never,
      "function f(){ return 1; }",
      "/project/src/app.ts",
    );
    expect(result).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Object-key merge: user providing exclude.functions retains default exclude.paths
// ---------------------------------------------------------------------------

describe("object-key merge for exclude via Vite plugin (Phase 2)", () => {
  it("providing only exclude.functions retains default exclude.paths — test files still excluded", () => {
    const plugin = flowTracer({ exclude: { functions: ["internalHelper"] } });
    const t = getTransform(plugin);
    const result = t.call(
      {} as never,
      "function f(){ return 1; }",
      "/project/src/app.test.ts",
    );
    expect(result).toBeNull();
  });

  it("providing exclude.paths replaces default — custom pattern applied instead", () => {
    // When user supplies exclude.paths, the default 10-pattern array is REPLACED.
    // A test file (app.test.ts) would normally be excluded by default but is NOT
    // excluded when the user replaces the array with a non-matching pattern.
    const plugin = flowTracer({ exclude: { paths: ["**/generated/**"] } });
    const t = getTransform(plugin);
    const result = t.call(
      {} as never,
      "function f(){ return 1; }",
      "/project/src/app.test.ts",
    );
    expect(result).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// normalizeConfig called once — normalized config reaches Babel
// ---------------------------------------------------------------------------

describe("normalizedConfig is passed to Babel (Phase 2)", () => {
  it("tracerName from normalized config reaches Babel output", () => {
    const plugin = flowTracer({ tracerName: "myTracer" });
    const t = getTransform(plugin);
    const result = t.call(
      {} as never,
      "function f(){ return 1; }",
      "/project/src/app.ts",
    ) as { code: string } | null;
    expect(result?.code).toContain("myTracer.enter");
  });

  it("mode: opt-in from normalized config suppresses instrumentation without @trace", () => {
    const plugin = flowTracer({ mode: "opt-in" });
    const t = getTransform(plugin);
    const result = t.call(
      {} as never,
      "function f(){ return 1; }",
      "/project/src/app.ts",
    ) as { code: string } | null;
    expect(result?.code ?? "").not.toContain("__flowTracer.enter");
  });
});
