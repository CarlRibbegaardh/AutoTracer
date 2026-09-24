/**
 * Phase 2 tests: root package API exports.
 *
 * Verifies that DEFAULT_CONFIG, normalizeConfig, and shouldProcessFile
 * are all exported from the package root index so that @autotracer/plugin-vite-flow
 * can consume them without importing internal files directly.
 */

import { describe, it, expect } from "vitest";
import * as rootModule from "../../src/index";

const mod = rootModule as Record<string, unknown>;

// ---------------------------------------------------------------------------
// Export presence
// ---------------------------------------------------------------------------

describe("Babel Flow root API — Phase 2 exports", () => {
  it("DEFAULT_CONFIG is exported from the root index", () => {
    expect(mod.DEFAULT_CONFIG).toBeDefined();
  });

  it("normalizeConfig is exported from the root index", () => {
    expect(mod.normalizeConfig).toBeDefined();
  });

  it("shouldProcessFile is exported from the root index", () => {
    expect(mod.shouldProcessFile).toBeDefined();
  });

  it("normalizeConfig is a function", () => {
    expect(typeof mod.normalizeConfig).toBe("function");
  });

  it("shouldProcessFile is a function", () => {
    expect(typeof mod.shouldProcessFile).toBe("function");
  });

  it("DEFAULT_CONFIG is an object", () => {
    expect(typeof mod.DEFAULT_CONFIG).toBe("object");
  });
});

// ---------------------------------------------------------------------------
// DEFAULT_CONFIG shape via root export
// ---------------------------------------------------------------------------

describe("DEFAULT_CONFIG via root export — shape (Phase 2)", () => {
  it("include.paths equals the default source-file glob", () => {
    const cfg = mod.DEFAULT_CONFIG as { include: { paths: string[] } };
    expect(cfg.include.paths).toEqual(["**/*.{js,jsx,mjs,ts,tsx,mts}"]);
  });

  it("exclude.paths has 10 entries", () => {
    const cfg = mod.DEFAULT_CONFIG as { exclude: { paths: string[] } };
    expect(cfg.exclude.paths).toHaveLength(10);
  });
});

// ---------------------------------------------------------------------------
// shouldProcessFile runtime behavior via root export
// ---------------------------------------------------------------------------

describe("shouldProcessFile via root export — runtime (Phase 2)", () => {
  type SPF = (
    filename: string,
    include?: { paths?: string[] },
    exclude?: { paths?: string[] }
  ) => boolean;

  it("returns true when filename matches include.paths and no exclude", () => {
    const shouldProcessFile = mod.shouldProcessFile as SPF;
    expect(
      shouldProcessFile(
        "/project/src/app.ts",
        { paths: ["**/*.{js,jsx,mjs,ts,tsx,mts}"] },
        {}
      )
    ).toBe(true);
  });

  it("returns false when filename does not match include.paths", () => {
    const shouldProcessFile = mod.shouldProcessFile as SPF;
    expect(
      shouldProcessFile(
        "/project/src/app.ts",
        { paths: ["**/lib/**"] },
        {}
      )
    ).toBe(false);
  });

  it("returns false when filename matches exclude.paths even if include matches", () => {
    const shouldProcessFile = mod.shouldProcessFile as SPF;
    expect(
      shouldProcessFile(
        "/project/src/app.test.ts",
        { paths: ["**/*.{js,jsx,mjs,ts,tsx,mts}"] },
        { paths: ["**/*.test.*"] }
      )
    ).toBe(false);
  });
});
