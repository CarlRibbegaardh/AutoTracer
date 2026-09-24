/**
 * Characterization / regression tests for normalizeConfig and DEFAULT_CONFIG.
 *
 * Pins the current expected behavior as a stable baseline. Any change to
 * DEFAULT_CONFIG, normalizeConfig merge semantics, or root-index exports
 * must be reflected here before the change is merged.
 *
 * Key invariants:
 * - DEFAULT_CONFIG carries real default include/exclude paths (mirroring the React18 plugin).
 * - normalizeConfig merges at the object-key level, not with a shallow replace.
 * - DEFAULT_CONFIG, normalizeConfig, and shouldProcessFile are exported from the package root index.
 * - include.functions and exclude.functions default to [] (spec §3).
 */

import { describe, it, expect } from "vitest";
import { normalizeConfig } from "../../src/normalizeConfig";
import { DEFAULT_CONFIG } from "../../src/types/index";
import * as rootModule from "../../src/index";

describe("DEFAULT_CONFIG — current shape (characterization)", () => {
  it("include has default paths for all JS/TS file types", () => {
    expect(DEFAULT_CONFIG.include).toEqual({
      paths: ["**/*.{js,jsx,mjs,ts,tsx,mts}"],
      functions: [],
    });
  });

  it("exclude has default noise-exclusion paths (mirrors React18 plugin)", () => {
    expect(DEFAULT_CONFIG.exclude).toEqual({
      paths: [
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
      ],
      functions: [],
    });
  });

  it("mode is opt-out", () => {
    expect(DEFAULT_CONFIG.mode).toBe("opt-out");
  });

  it("logExceptions is true", () => {
    expect(DEFAULT_CONFIG.logExceptions).toBe(true);
  });

  it("exceptionLogLevel is debug", () => {
    expect(DEFAULT_CONFIG.exceptionLogLevel).toBe("debug");
  });

  it("tracerName is __flowTracer", () => {
    expect(DEFAULT_CONFIG.tracerName).toBe("__flowTracer");
  });

  it("outputMode is absent", () => {
    expect(DEFAULT_CONFIG.outputMode).toBeUndefined();
  });

  it("prefix is absent", () => {
    expect(DEFAULT_CONFIG.prefix).toBeUndefined();
  });
});

describe("normalizeConfig — current behavior (characterization)", () => {
  describe("called with no argument", () => {
    it("returns logExceptions true", () => {
      const result = normalizeConfig();
      expect(result.logExceptions).toBe(true);
    });

    it("returns exceptionLogLevel debug", () => {
      const result = normalizeConfig();
      expect(result.exceptionLogLevel).toBe("debug");
    });

    it("returns tracerName __flowTracer", () => {
      const result = normalizeConfig();
      expect(result.tracerName).toBe("__flowTracer");
    });

    it("returns mode opt-out", () => {
      const result = normalizeConfig();
      expect(result.mode).toBe("opt-out");
    });

    it("returns include with default paths", () => {
      expect(normalizeConfig().include).toEqual({
        paths: ["**/*.{js,jsx,mjs,ts,tsx,mts}"],
        functions: [],
      });
    });

    it("returns exclude with default noise-exclusion paths", () => {
      expect(normalizeConfig().exclude.paths).toHaveLength(10);
    });

    it("returns outputMode undefined", () => {
      expect(normalizeConfig().outputMode).toBeUndefined();
    });

    it("returns prefix undefined", () => {
      expect(normalizeConfig().prefix).toBeUndefined();
    });
  });

  describe("called with partial include", () => {
    it("user-supplied paths key replaces default paths key (object-key merge)", () => {
      const result = normalizeConfig({ include: { paths: ["**/src/**"] } });
      expect(result.include.paths).toEqual(["**/src/**"]);
      expect(result.include.functions).toEqual([]);
    });

    it("providing only functions in include — functions merged, default paths preserved (object-key merge)", () => {
      const result = normalizeConfig({
        include: { functions: ["handleClick"] },
      });
      // object-key merge preserves default include.paths
      // because only the functions key was supplied.
      expect(result.include.functions).toEqual(["handleClick"]);
      expect(result.include.paths).toEqual(["**/*.{js,jsx,mjs,ts,tsx,mts}"]);
    });
  });

  describe("called with partial exclude", () => {
    it("user-supplied paths key replaces default paths key in exclude (object-key merge)", () => {
      const result = normalizeConfig({ exclude: { paths: ["**/*.test.*"] } });
      expect(result.exclude.paths).toEqual(["**/*.test.*"]);
      expect(result.exclude.functions).toEqual([]);
    });

    it("providing only functions in exclude — functions merged, default paths preserved (object-key merge)", () => {
      const result = normalizeConfig({
        exclude: { functions: ["privateHelper"] },
      });
      // object-key merge preserves default exclude.paths
      // because only the functions key was supplied.
      expect(result.exclude.functions).toEqual(["privateHelper"]);
      expect(result.exclude.paths).toHaveLength(10);
    });
  });

  describe("called with explicit values", () => {
    it("propagates logExceptions: false", () => {
      expect(normalizeConfig({ logExceptions: false }).logExceptions).toBe(
        false,
      );
    });

    it("propagates exceptionLogLevel: warn", () => {
      expect(
        normalizeConfig({ exceptionLogLevel: "warn" }).exceptionLogLevel,
      ).toBe("warn");
    });

    it("propagates tracerName", () => {
      expect(normalizeConfig({ tracerName: "myTracer" }).tracerName).toBe(
        "myTracer",
      );
    });

    it("propagates mode: opt-in", () => {
      expect(normalizeConfig({ mode: "opt-in" }).mode).toBe("opt-in");
    });

    it("propagates outputMode: devtools", () => {
      expect(normalizeConfig({ outputMode: "devtools" }).outputMode).toBe(
        "devtools",
      );
    });

    it("propagates outputMode: copy-paste", () => {
      expect(normalizeConfig({ outputMode: "copy-paste" }).outputMode).toBe(
        "copy-paste",
      );
    });

    it("ignores invalid outputMode and omits it from result", () => {
      // An invalid outputMode (not devtools or copy-paste) is not propagated
      const result = normalizeConfig({ outputMode: "invalid" as never });
      expect(result.outputMode).toBeUndefined();
    });

    it("propagates prefix", () => {
      expect(normalizeConfig({ prefix: "MyApp" }).prefix).toBe("MyApp");
    });
  });
});

describe("DEFAULT_CONFIG is exported from the types index (characterization)", () => {
  it("DEFAULT_CONFIG import resolves without error", () => {
    expect(DEFAULT_CONFIG).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Root package API surface (characterization)
// These tests pin what is currently exported from src/index.ts (package root).
// ---------------------------------------------------------------------------

describe("Babel Flow root API surface (characterization)", () => {
  it("root module default export is defined (the Babel plugin)", () => {
    expect(rootModule.default).toBeDefined();
  });

  it("root module exports BabelPluginFlowConfig as a type only — not a runtime value", () => {
    // BabelPluginFlowConfig is a type export; it does not appear as a runtime
    // property on the module object.
    expect(
      (rootModule as Record<string, unknown>).BabelPluginFlowConfig,
    ).toBeUndefined();
  });

  it("normalizeConfig is exported from the root index", () => {
    expect(
      (rootModule as Record<string, unknown>).normalizeConfig,
    ).toBeDefined();
  });

  it("shouldProcessFile is exported from the root index", () => {
    expect(
      (rootModule as Record<string, unknown>).shouldProcessFile,
    ).toBeDefined();
  });

  it("DEFAULT_CONFIG is exported from the root index", () => {
    expect(
      (rootModule as Record<string, unknown>).DEFAULT_CONFIG,
    ).toBeDefined();
  });
});
