import { describe, it, expect } from "vitest";
import { transform } from "../../src/functions/transform/transform";
import { normalizeConfig } from "../../src/functions/config/normalizeConfig";
import type { TransformContext } from "../../src/interfaces/TransformContext";

/**
 * Canonical single-target outcome matrix tests for the eligibility-first contract.
 *
 * Spec reference: docs/work/spec/flow-plugin-trace-disable-pragma.md §2a
 *
 * | Path eligible | Target eligible | Effective disable | Effective enable | Mode      | Outcome    |
 * | No            | Any             | Any               | Any              | Any       | Skip       |
 * | Yes           | No              | Any               | Any              | Any       | Skip       |
 * | Yes           | Yes             | Yes               | Any              | Any       | Skip       |
 * | Yes           | Yes             | No                | Yes              | Any       | Instrument |
 * | Yes           | Yes             | No                | No               | opt-in    | Skip       |
 * | Yes           | Yes             | No                | No               | opt-out   | Instrument |
 */
describe("Eligibility-first: canonical single-target outcome matrix", () => {
  const run = (code: string, context: TransformContext) => transform(code, context);

  // Row 1: path not eligible → skip (shouldProcessFile gates this)
  it("path include miss → skip regardless of pragma", () => {
    const code = "// @trace\nexport function Button() { return <div/>; }";
    const context: TransformContext = {
      filename: "src/Button.tsx",
      config: normalizeConfig({
        mode: "opt-out",
        importSource: "@autotracer/react18",
        include: { paths: ["other/**/*.tsx"], components: [] },
        exclude: { paths: [], components: [] },
        labelHooks: [],
      }),
    };
    const result = run(code, context);
    expect(result.injected).toBe(false);
  });

  // Row 2: target include miss → skip even with @trace (eligibility-first)
  it("target include miss + @trace → skip (@trace cannot bypass include.components)", () => {
    const code = "// @trace\nexport function Button() { return <div/>; }";
    const context: TransformContext = {
      filename: "src/Button.tsx",
      config: normalizeConfig({
        mode: "opt-out",
        importSource: "@autotracer/react18",
        include: { paths: ["src/**/*.tsx"], components: ["OtherComponent"] },
        exclude: { paths: [], components: [] },
        labelHooks: [],
      }),
    };
    const result = run(code, context);
    expect(result.injected).toBe(false);
    expect(result.components).toHaveLength(0);
  });

  // Row 2: explicit target exclude → skip even with @trace
  it("explicit target exclude + @trace → skip (@trace cannot override exclude.components)", () => {
    const code = "// @trace\nexport function Button() { return <div/>; }";
    const context: TransformContext = {
      filename: "src/Button.tsx",
      config: normalizeConfig({
        mode: "opt-out",
        importSource: "@autotracer/react18",
        include: { paths: ["src/**/*.tsx"], components: [] },
        exclude: { paths: [], components: ["Button"] },
        labelHooks: [],
      }),
    };
    const result = run(code, context);
    expect(result.injected).toBe(false);
    expect(result.components).toHaveLength(0);
  });

  // Row 3: target eligible + @trace-disable → skip
  it("target eligible + @trace-disable → skip", () => {
    const code = "// @trace-disable\nexport function Button() { return <div/>; }";
    const context: TransformContext = {
      filename: "src/Button.tsx",
      config: normalizeConfig({
        mode: "opt-out",
        importSource: "@autotracer/react18",
        include: { paths: ["src/**/*.tsx"], components: [] },
        exclude: { paths: [], components: [] },
        labelHooks: [],
      }),
    };
    const result = run(code, context);
    expect(result.injected).toBe(false);
    expect(result.components).toHaveLength(0);
  });

  // Row 4: target eligible + no disable + @trace → instrument (any mode)
  it("target eligible + @trace → instrument regardless of mode (opt-in)", () => {
    const code = "// @trace\nexport function Button() { return <div/>; }";
    const context: TransformContext = {
      filename: "src/Button.tsx",
      config: normalizeConfig({
        mode: "opt-in",
        importSource: "@autotracer/react18",
        include: { paths: ["src/**/*.tsx"], components: [] },
        exclude: { paths: [], components: [] },
        labelHooks: [],
      }),
    };
    const result = run(code, context);
    expect(result.injected).toBe(true);
    expect(result.components).toHaveLength(1);
    expect(result.components[0].name).toBe("Button");
  });

  it("target eligible + @trace → instrument regardless of mode (opt-out)", () => {
    const code = "// @trace\nexport function Button() { return <div/>; }";
    const context: TransformContext = {
      filename: "src/Button.tsx",
      config: normalizeConfig({
        mode: "opt-out",
        importSource: "@autotracer/react18",
        include: { paths: ["src/**/*.tsx"], components: [] },
        exclude: { paths: [], components: [] },
        labelHooks: [],
      }),
    };
    const result = run(code, context);
    expect(result.injected).toBe(true);
    expect(result.components).toHaveLength(1);
    expect(result.components[0].name).toBe("Button");
  });

  // Row 5: target eligible + no pragmas + opt-in → skip
  it("target eligible + no pragma + opt-in → skip", () => {
    const code = "export function Button() { return <div/>; }";
    const context: TransformContext = {
      filename: "src/Button.tsx",
      config: normalizeConfig({
        mode: "opt-in",
        importSource: "@autotracer/react18",
        include: { paths: ["src/**/*.tsx"], components: [] },
        exclude: { paths: [], components: [] },
        labelHooks: [],
      }),
    };
    const result = run(code, context);
    expect(result.injected).toBe(false);
    expect(result.components).toHaveLength(0);
  });

  // Row 6: target eligible + no pragmas + opt-out → instrument
  it("target eligible + no pragma + opt-out → instrument", () => {
    const code = "export function Button() { return <div/>; }";
    const context: TransformContext = {
      filename: "src/Button.tsx",
      config: normalizeConfig({
        mode: "opt-out",
        importSource: "@autotracer/react18",
        include: { paths: ["src/**/*.tsx"], components: [] },
        exclude: { paths: [], components: [] },
        labelHooks: [],
      }),
    };
    const result = run(code, context);
    expect(result.injected).toBe(true);
    expect(result.components).toHaveLength(1);
    expect(result.components[0].name).toBe("Button");
  });

  // Additional: @trace-disable on excluded target is redundant but still skips
  it("@trace-disable on explicitly excluded target → skip (redundant disable)", () => {
    const code = "// @trace-disable\nexport function Button() { return <div/>; }";
    const context: TransformContext = {
      filename: "src/Button.tsx",
      config: normalizeConfig({
        mode: "opt-out",
        importSource: "@autotracer/react18",
        include: { paths: ["src/**/*.tsx"], components: [] },
        exclude: { paths: [], components: ["Button"] },
        labelHooks: [],
      }),
    };
    const result = run(code, context);
    expect(result.injected).toBe(false);
    expect(result.components).toHaveLength(0);
  });

  // include.components allowlist + target in list + no pragma + opt-out → instrument
  it("include.components allowlist + target in list + opt-out → instrument", () => {
    const code = "export function Button() { return <div/>; }\nexport function Card() { return <div/>; }";
    const context: TransformContext = {
      filename: "src/Button.tsx",
      config: normalizeConfig({
        mode: "opt-out",
        importSource: "@autotracer/react18",
        include: { paths: ["src/**/*.tsx"], components: ["Button"] },
        exclude: { paths: [], components: [] },
        labelHooks: [],
      }),
    };
    const result = run(code, context);
    expect(result.injected).toBe(true);
    expect(result.components.map((c) => c.name)).toEqual(["Button"]);
  });
});
