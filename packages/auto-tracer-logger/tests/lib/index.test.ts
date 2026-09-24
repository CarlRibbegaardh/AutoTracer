import { describe, expect, it } from "vitest";

// Note: we import the package dynamically inside tests so that mocks
// (vi.doMock) can be applied before the module is evaluated.

describe("index exports", () => {
  it("should export Logger interface type", async () => {
    const logger = await import("@src/index.js");
    // Type exports can't be runtime-checked, but we verify the module loads
    expect(logger).toBeDefined();
  });

  it("should export getLogger function", async () => {
    const { getLogger } = await import("@src/index.js");
    expect(getLogger).toBeTypeOf("function");
  });

  it("should export themes object", async () => {
    const { themes } = await import("@src/index.js");
    expect(themes).toBeTypeOf("object");
    expect(themes.default).toBeDefined();
    expect(themes.emoji).toBeDefined();
    expect(themes.minimal).toBeDefined();
  });

  it("should export all type exports", async () => {
    const logger = await import("@src/index.js");
    // ExitHandle, LogLevel, Theme are type-only exports
    // We just verify the module loads without errors
    expect(logger).toBeDefined();
  });

  it("should export legacy global functions", async () => {
    const {
      fatal,
      error,
      warn,
      log,
      info,
      debug,
      verbose,
      trace,
      group,
      groupEnd,
      enter,
      exit,
      setLogLevel,
      getLogLevel,
      setTheme,
      getTheme,
    } = await import("@src/index.js");

    // Verify all legacy functions are still exported
    expect(fatal).toBeTypeOf("function");
    expect(error).toBeTypeOf("function");
    expect(warn).toBeTypeOf("function");
    expect(log).toBeTypeOf("function");
    expect(info).toBeTypeOf("function");
    expect(debug).toBeTypeOf("function");
    expect(verbose).toBeTypeOf("function");
    expect(trace).toBeTypeOf("function");
    expect(group).toBeTypeOf("function");
    expect(groupEnd).toBeTypeOf("function");
    expect(enter).toBeTypeOf("function");
    expect(exit).toBeTypeOf("function");
    expect(setLogLevel).toBeTypeOf("function");
    expect(getLogLevel).toBeTypeOf("function");
    expect(setTheme).toBeTypeOf("function");
    expect(getTheme).toBeTypeOf("function");
  });
});
