/**
 * Characterization tests for Vite Flow plugin path filtering and config flow.
 *
 * These tests pin the CURRENT behavior before the default paths change is
 * applied. They must not be changed to make a failing test pass during
 * Phase 1. If an implementation change requires an expectation here to
 * change, stop and discuss before modifying any assertion.
 *
 * Phase: 1 — characterization only, no production-code changes.
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
// Hard-coded skip guards
// ---------------------------------------------------------------------------

describe("hard-coded skip guards (characterization)", () => {
  it("skips virtual module IDs starting with \\0", () => {
    const t = getTransform(flowTracer());
    expect(t.call({} as never, "function f(){}", "\0virtual:module")).toBeNull();
  });

  it("skips IDs containing a query string (?)", () => {
    const t = getTransform(flowTracer());
    expect(
      t.call({} as never, "function f(){}", "/project/src/app.ts?raw"),
    ).toBeNull();
  });

  it("skips IDs containing node_modules", () => {
    const t = getTransform(flowTracer());
    expect(
      t.call(
        {} as never,
        "function f(){}",
        "/project/node_modules/pkg/index.js",
      ),
    ).toBeNull();
  });

  it("skips auto-tracer-flow source paths", () => {
    const t = getTransform(flowTracer());
    expect(
      t.call(
        {} as never,
        "function f(){}",
        "/project/packages/auto-tracer-flow/src/index.ts",
      ),
    ).toBeNull();
  });

  it("skips auto-tracer-flow dist paths", () => {
    const t = getTransform(flowTracer());
    expect(
      t.call(
        {} as never,
        "function f(){}",
        "/project/packages/auto-tracer-flow/dist/index.js",
      ),
    ).toBeNull();
  });

  it("skips auto-tracer-logger source paths", () => {
    const t = getTransform(flowTracer());
    expect(
      t.call(
        {} as never,
        "function f(){}",
        "/project/packages/auto-tracer-logger/src/index.ts",
      ),
    ).toBeNull();
  });

  it("skips auto-tracer-logger dist paths", () => {
    const t = getTransform(flowTracer());
    expect(
      t.call(
        {} as never,
        "function f(){}",
        "/project/packages/auto-tracer-logger/dist/index.js",
      ),
    ).toBeNull();
  });

  it("skips auto-tracer-plugin-* source paths", () => {
    const t = getTransform(flowTracer());
    expect(
      t.call(
        {} as never,
        "function f(){}",
        "/project/packages/auto-tracer-plugin-babel-flow/src/index.ts",
      ),
    ).toBeNull();
  });

  it("skips auto-tracer-plugin-* dist paths", () => {
    const t = getTransform(flowTracer());
    expect(
      t.call(
        {} as never,
        "function f(){}",
        "/project/packages/auto-tracer-plugin-vite-flow/dist/index.js",
      ),
    ).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// File extension filtering
// ---------------------------------------------------------------------------

describe("extension filtering (characterization)", () => {
  it("skips .css files", () => {
    const t = getTransform(flowTracer());
    expect(t.call({} as never, "body {}", "/project/src/styles.css")).toBeNull();
  });

  it("skips .html files", () => {
    const t = getTransform(flowTracer());
    expect(
      t.call({} as never, "<html></html>", "/project/src/index.html"),
    ).toBeNull();
  });

  it("skips .json files", () => {
    const t = getTransform(flowTracer());
    expect(
      t.call({} as never, '{"a":1}', "/project/src/data.json"),
    ).toBeNull();
  });

  it("processes .js files", () => {
    const t = getTransform(flowTracer());
    const result = t.call(
      {} as never,
      "function f(){ return 1; }",
      "/project/src/app.js",
    );
    expect(result).not.toBeNull();
  });

  it("processes .jsx files", () => {
    const t = getTransform(flowTracer());
    const result = t.call(
      {} as never,
      "function f(){ return 1; }",
      "/project/src/App.jsx",
    );
    expect(result).not.toBeNull();
  });

  it("processes .ts files", () => {
    const t = getTransform(flowTracer());
    const result = t.call(
      {} as never,
      "function f(): number { return 1; }",
      "/project/src/app.ts",
    );
    expect(result).not.toBeNull();
  });

  it("processes .tsx files", () => {
    const t = getTransform(flowTracer());
    const result = t.call(
      {} as never,
      "function f(): number { return 1; }",
      "/project/src/App.tsx",
    );
    expect(result).not.toBeNull();
  });

  it("processes .mjs files", () => {
    const t = getTransform(flowTracer());
    const result = t.call(
      {} as never,
      "export function f(){ return 1; }",
      "/project/src/app.mjs",
    );
    expect(result).not.toBeNull();
  });

  it("processes .mts files (plain JS code — TS syntax requires TypeScript preset not triggered by .mts)", () => {
    // NOTE: The Vite plugin's TypeScript preset check is /\.tsx?$/ which does NOT
    // match .mts files. To observe that the extension itself is recognized, use
    // plain JS code. Using TypeScript syntax with .mts returns null (Babel parse
    // error — no preset applied).
    const t = getTransform(flowTracer());
    const result = t.call(
      {} as never,
      "export function f() { return 1; }",
      "/project/src/app.mts",
    );
    expect(result).not.toBeNull();
  });

  it(".mts files with TypeScript syntax return null — TypeScript preset not applied (current behavior)", () => {
    // The Vite plugin check is /\.tsx?$/ which misses .mts.
    // Without the TypeScript preset, Babel cannot parse return type annotations
    // and throws; the catch block returns null.
    const t = getTransform(flowTracer());
    const result = t.call(
      {} as never,
      "export function f(): number { return 1; }",
      "/project/src/app.mts",
    );
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// include / exclude path filtering — current behavior
// No defaults are applied today: empty include = process all; empty exclude = exclude nothing.
// ---------------------------------------------------------------------------

describe("include/exclude path filtering — current behavior (characterization)", () => {
  describe("no include or exclude configured", () => {
    it("processes all eligible file extensions without path restriction", () => {
      const t = getTransform(flowTracer());
      const result = t.call(
        {} as never,
        "function f(){ return 1; }",
        "/project/anything/deeply/nested/file.ts",
      );
      expect(result).not.toBeNull();
    });
  });

  describe("user-provided include.paths", () => {
    it("processes files matching the include pattern", () => {
      const plugin = flowTracer({ include: { paths: ["**/src/**"] } });
      const t = getTransform(plugin);
      const result = t.call(
        {} as never,
        "function f(){ return 1; }",
        "/project/src/app.ts",
      );
      expect(result).not.toBeNull();
    });

    it("skips files not matching the include pattern", () => {
      const plugin = flowTracer({ include: { paths: ["**/src/**"] } });
      const t = getTransform(plugin);
      const result = t.call(
        {} as never,
        "function f(){ return 1; }",
        "/project/lib/app.ts",
      );
      expect(result).toBeNull();
    });
  });

  describe("user-provided exclude.paths", () => {
    it("skips files matching the exclude pattern", () => {
      const plugin = flowTracer({ exclude: { paths: ["**/generated/**"] } });
      const t = getTransform(plugin);
      const result = t.call(
        {} as never,
        "function f(){ return 1; }",
        "/project/src/generated/thing.ts",
      );
      expect(result).toBeNull();
    });

    it("processes files not matching the exclude pattern", () => {
      const plugin = flowTracer({ exclude: { paths: ["**/generated/**"] } });
      const t = getTransform(plugin);
      const result = t.call(
        {} as never,
        "function f(){ return 1; }",
        "/project/src/app.ts",
      );
      expect(result).not.toBeNull();
    });
  });

  describe("default exclusion of test and build files (Phase 2 behavior)", () => {
    it("test files are excluded by default (default exclude.paths includes **/*.test.*)", () => {
      // Phase 2: test files are excluded because DEFAULT_CONFIG.exclude.paths
      // includes '**/*.test.*'. normalizeConfig() is called at plugin init.
      const t = getTransform(flowTracer());
      const result = t.call(
        {} as never,
        "function f(){ return 1; }",
        "/project/src/app.test.ts",
      );
      expect(result).toBeNull();
    });

    it("spec files are excluded by default (default exclude.paths includes **/*.spec.*)", () => {
      const t = getTransform(flowTracer());
      const result = t.call(
        {} as never,
        "function f(){ return 1; }",
        "/project/src/app.spec.ts",
      );
      expect(result).toBeNull();
    });

    it("dist files are excluded by default (default exclude.paths includes **/dist/**)", () => {
      // Phase 2: dist is now excluded by default via DEFAULT_CONFIG.
      const t = getTransform(flowTracer());
      const result = t.call(
        {} as never,
        "function f(){ return 1; }",
        "/project/dist/app.js",
      );
      expect(result).toBeNull();
    });
  });

  describe("Windows-style absolute paths — current behavior (characterization)", () => {
    it("Windows-style .ts path with no include configured IS processed (current behavior)", () => {
      // Current behavior: a Windows-style absolute path like
      // C:\Projects\MyApp\src\app.ts is processed normally when no include/exclude
      // is configured. The TypeScript preset is applied because /\.tsx?$/ matches
      // .ts and the Babel transform succeeds.
      const t = getTransform(flowTracer());
      const result = t.call(
        {} as never,
        "function f(): number { return 1; }",
        "C:\\Projects\\MyApp\\src\\app.ts",
      ) as { code: string } | null;
      expect(result).not.toBeNull();
      expect(result?.code).toContain("__flowTracer");
    });

    it("Windows-style path with matching include.paths IS processed (shared filter normalizes backslashes)", () => {
      // Current behavior: the shared shouldProcessFile filter (in @autotracer/plugin-babel-flow)
      // normalizes \ to / internally, so a Windows-style path matches a forward-slash glob pattern.
      const plugin = flowTracer({ include: { paths: ["**/src/**"] } });
      const t = getTransform(plugin);
      const result = t.call(
        {} as never,
        "function f(): number { return 1; }",
        "C:\\Projects\\MyApp\\src\\app.ts",
      ) as { code: string } | null;
      expect(result).not.toBeNull();
      expect(result?.code).toContain("__flowTracer");
    });

    it("Windows-style path with non-matching include.paths is skipped (current behavior)", () => {
      // When include is set and the Windows path does not match the pattern, null.
      const plugin = flowTracer({ include: { paths: ["**/lib/**"] } });
      const t = getTransform(plugin);
      const result = t.call(
        {} as never,
        "function f(): number { return 1; }",
        "C:\\Projects\\MyApp\\src\\app.ts",
      );
      expect(result).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// Config passthrough to Babel
// ---------------------------------------------------------------------------

describe("config passthrough to Babel plugin (characterization)", () => {
  it("tracerName is passed through to Babel output", () => {
    const plugin = flowTracer({ tracerName: "myTracer" });
    const t = getTransform(plugin);
    const result = t.call(
      {} as never,
      "function f(){ return 1; }",
      "/project/src/app.ts",
    ) as { code: string } | null;
    expect(result?.code).toContain("myTracer.enter");
  });

  it("logExceptions: false is passed through to Babel output", () => {
    const plugin = flowTracer({ logExceptions: false });
    const t = getTransform(plugin);
    const result = t.call(
      {} as never,
      "function f(){ return 1; }",
      "/project/src/app.ts",
    ) as { code: string } | null;
    expect(result?.code).not.toContain("catch");
  });

  it("normalized config (including defaults) is passed to Babel (Phase 2 behavior)", () => {
    // Phase 2: options are normalized via normalizeConfig() before being forwarded
    // to the Babel plugin. The normalized output proves the options reached Babel.
    const plugin = flowTracer({ mode: "opt-in" });
    const t = getTransform(plugin);
    // In opt-in mode, a function without @trace pragma is not instrumented
    const result = t.call(
      {} as never,
      "function f(){ return 1; }",
      "/project/src/app.ts",
    ) as { code: string } | null;
    // With opt-in mode and no @trace pragma the function must NOT be instrumented
    expect(result?.code ?? "").not.toContain("__flowTracer.enter");
  });
});

// Note: root export surface characterization for @autotracer/plugin-babel-flow
// is tested in packages/auto-tracer-plugin-babel-flow/tests/unit/normalizeConfig.characterization.test.ts
// because the Vite Flow tsconfig (NodeNext + verbatimModuleSyntax) cannot
// type-check the Babel Flow ESM source files directly.
