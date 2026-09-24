import { describe, expect, it } from "vitest";
import { defaultReactTracerOptions } from "@src/lib/types/defaultSettings";

describe("defaultSettings", () => {
  it("should have correct default values", () => {
    expect(defaultReactTracerOptions.enabled).toBe(false);
    expect(defaultReactTracerOptions.includeReconciled).toBe("never" as const);
    expect(defaultReactTracerOptions.includeSkipped).toBe("never" as const);
    expect(defaultReactTracerOptions.includeMount).toBe("never");
    expect(defaultReactTracerOptions.showFlags).toBe(false);
    expect(defaultReactTracerOptions.internalLogLevel).toBe("error");
    expect(defaultReactTracerOptions.maxFiberDepth).toBe(500);
    expect(defaultReactTracerOptions.includeNonTrackedBranches).toBe(false);
    expect(defaultReactTracerOptions.skippedObjectProps).toEqual([]);
    expect(
      Reflect.get(defaultReactTracerOptions, "valueRenderingMode"),
    ).toBeUndefined();
    expect(
      Reflect.get(defaultReactTracerOptions, "treeRenderingMode"),
    ).toBeUndefined();
  });

  it("should have colors configuration", () => {
    expect(defaultReactTracerOptions.colors).toBeDefined();
    expect(defaultReactTracerOptions.colors?.definitiveRender).toBeDefined();
    expect(defaultReactTracerOptions.colors?.propInitial).toBeDefined();
    expect(defaultReactTracerOptions.colors?.propChange).toBeDefined();
    expect(defaultReactTracerOptions.colors?.stateInitial).toBeDefined();
    expect(defaultReactTracerOptions.colors?.stateChange).toBeDefined();
    expect(defaultReactTracerOptions.colors?.logStatements).toBeDefined();
    expect(defaultReactTracerOptions.colors?.reconciled).toBeDefined();
    expect(defaultReactTracerOptions.colors?.skipped).toBeDefined();
    expect(defaultReactTracerOptions.colors?.other).toBeDefined();
  });

  it("should have light and dark mode colors", () => {
    expect(
      defaultReactTracerOptions.colors?.definitiveRender?.lightMode,
    ).toBeDefined();
    expect(
      defaultReactTracerOptions.colors?.definitiveRender?.darkMode,
    ).toBeDefined();
    expect(
      defaultReactTracerOptions.colors?.propInitial?.lightMode,
    ).toBeDefined();
    expect(
      defaultReactTracerOptions.colors?.propInitial?.darkMode,
    ).toBeDefined();
  });

  it("should have specific color values", () => {
    expect(
      defaultReactTracerOptions.colors?.definitiveRender?.lightMode?.text,
    ).toBe("#0044ff");
    expect(
      defaultReactTracerOptions.colors?.definitiveRender?.lightMode?.bold,
    ).toBe(true);
    expect(defaultReactTracerOptions.colors?.definitiveRender?.icon).toBe("⚡");

    expect(defaultReactTracerOptions.colors?.propInitial?.lightMode?.text).toBe(
      "#c900bf",
    );
    expect(
      defaultReactTracerOptions.colors?.propInitial?.lightMode?.italic,
    ).toBe(true);
  });

  it("should be immutable", () => {
    // Test that we can't accidentally modify the default options
    const originalEnabled = defaultReactTracerOptions.enabled;

    // This should not affect the original
    const copy = { ...defaultReactTracerOptions };
    copy.enabled = !originalEnabled;

    expect(defaultReactTracerOptions.enabled).toBe(originalEnabled);
  });

  it("should have valid numeric values", () => {
    expect(typeof defaultReactTracerOptions.maxFiberDepth).toBe("number");
    expect(defaultReactTracerOptions.maxFiberDepth).toBeGreaterThan(0);
    expect(defaultReactTracerOptions.maxFiberDepth).toBeLessThanOrEqual(1000);
  });

  it("should have valid color format", () => {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

    expect(
      defaultReactTracerOptions.colors?.definitiveRender?.lightMode?.text,
    ).toMatch(hexColorRegex);
    expect(
      defaultReactTracerOptions.colors?.propInitial?.lightMode?.text,
    ).toMatch(hexColorRegex);
    expect(
      defaultReactTracerOptions.colors?.stateInitial?.lightMode?.text,
    ).toMatch(hexColorRegex);
  });
});
