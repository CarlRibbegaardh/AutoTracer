/**
 * Phase 2 tests: DEFAULT_CONFIG new paths and object-key merge behavior.
 *
 * These tests assert the INTENDED POST-PHASE-2 behavior:
 * - DEFAULT_CONFIG carries real default include/exclude path arrays.
 * - normalizeConfig merges per object-key: a user-supplied key replaces the
 *   default for that key; an omitted key retains the default.
 * - Arrays are never concatenated.
 */

import { describe, it, expect } from "vitest";
import { DEFAULT_CONFIG } from "../../src/types/index";
import { normalizeConfig } from "../../src/normalizeConfig";

/** Expected default include paths (spec §1). */
const EXPECTED_INCLUDE_PATHS = ["**/*.{js,jsx,mjs,ts,tsx,mts}"] as const;

/** Expected default exclude paths — mirror of React18 plugin (spec §2). */
const EXPECTED_EXCLUDE_PATHS = [
  "**/*.test.*",
  "**/*.spec.*",
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/.next/**",
  "**/coverage/**",
  "**/tests/**",
  "**/test/**",
  "**/__tests__/**",
] as const;

// ---------------------------------------------------------------------------
// DEFAULT_CONFIG shape
// ---------------------------------------------------------------------------

describe("DEFAULT_CONFIG — new default paths (Phase 2)", () => {
  it("include.paths equals the default source-file glob", () => {
    expect(DEFAULT_CONFIG.include.paths).toEqual([...EXPECTED_INCLUDE_PATHS]);
  });

  it("exclude.paths equals the 10-pattern noise-exclusion array", () => {
    expect(DEFAULT_CONFIG.exclude.paths).toEqual([...EXPECTED_EXCLUDE_PATHS]);
  });

  it("include.functions is an empty array (spec §3)", () => {
    expect(DEFAULT_CONFIG.include.functions).toEqual([]);
  });

  it("exclude.functions is an empty array (spec §3)", () => {
    expect(DEFAULT_CONFIG.exclude.functions).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// normalizeConfig — called with no argument
// ---------------------------------------------------------------------------

describe("normalizeConfig — defaults when called with no argument (Phase 2)", () => {
  it("returns include.paths equal to the default glob", () => {
    expect(normalizeConfig().include.paths).toEqual([
      ...EXPECTED_INCLUDE_PATHS,
    ]);
  });

  it("returns exclude.paths equal to the default 10-pattern array", () => {
    expect(normalizeConfig().exclude.paths).toEqual([
      ...EXPECTED_EXCLUDE_PATHS,
    ]);
  });
});

// ---------------------------------------------------------------------------
// normalizeConfig — object-key merge for include
// ---------------------------------------------------------------------------

describe("normalizeConfig — include object-key merge (Phase 2)", () => {
  it("providing only include.functions preserves default include.paths", () => {
    const result = normalizeConfig({ include: { functions: ["handleClick"] } });
    expect(result.include.paths).toEqual([...EXPECTED_INCLUDE_PATHS]);
    expect(result.include.functions).toEqual(["handleClick"]);
  });

  it("providing include.paths replaces the default paths array entirely", () => {
    const result = normalizeConfig({ include: { paths: ["**/src/**"] } });
    expect(result.include.paths).toEqual(["**/src/**"]);
  });

  it("providing both include.paths and include.functions replaces both keys", () => {
    const result = normalizeConfig({
      include: { paths: ["**/src/**"], functions: ["handler*"] },
    });
    expect(result.include.paths).toEqual(["**/src/**"]);
    expect(result.include.functions).toEqual(["handler*"]);
  });

  it("providing empty include.paths replaces the default with an empty array", () => {
    const result = normalizeConfig({ include: { paths: [] } });
    expect(result.include.paths).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// normalizeConfig — object-key merge for exclude
// ---------------------------------------------------------------------------

describe("normalizeConfig — exclude object-key merge (Phase 2)", () => {
  it("providing only exclude.functions preserves default exclude.paths", () => {
    const result = normalizeConfig({
      exclude: { functions: ["internalHelper"] },
    });
    expect(result.exclude.paths).toEqual([...EXPECTED_EXCLUDE_PATHS]);
    expect(result.exclude.functions).toEqual(["internalHelper"]);
  });

  it("providing exclude.paths replaces the default paths array entirely", () => {
    const result = normalizeConfig({ exclude: { paths: ["**/generated/**"] } });
    expect(result.exclude.paths).toEqual(["**/generated/**"]);
  });

  it("providing both exclude.paths and exclude.functions replaces both keys", () => {
    const result = normalizeConfig({
      exclude: { paths: ["**/mock/**"], functions: ["legacy*"] },
    });
    expect(result.exclude.paths).toEqual(["**/mock/**"]);
    expect(result.exclude.functions).toEqual(["legacy*"]);
  });

  it("providing empty exclude.paths replaces the default with an empty array", () => {
    const result = normalizeConfig({ exclude: { paths: [] } });
    expect(result.exclude.paths).toEqual([]);
  });
});
