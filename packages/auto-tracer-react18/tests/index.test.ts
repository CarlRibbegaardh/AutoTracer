import { describe, expect, it } from "vitest";

// Note: we import the package dynamically inside tests so that mocks
// (vi.doMock) can be applied before the module is evaluated.

describe("index exports", () => {
  it("should export reactTracer functions", async () => {
    const useTraceExports = await import("@src/index.js");
    expect(typeof useTraceExports.reactTracer).toBe("function");
    expect(typeof useTraceExports.isReactTracerInitialized).toBe("function");
    expect(typeof useTraceExports.stopReactTracer).toBe("function");
    expect(typeof useTraceExports.updateReactTracerOptions).toBe("function");
    expect(typeof useTraceExports.useReactTracer).toBe("function");
  });

  it("should have all expected exports", async () => {
    const useTraceExports = await import("@src/index.js");
    const expectedExports = [
      "reactTracer",
      "isReactTracerInitialized",
      "stopReactTracer",
      "updateReactTracerOptions",
      "useReactTracer",
    ];

    expectedExports.forEach((exportName) => {
      expect(useTraceExports).toHaveProperty(exportName);
    });
  });

  it("should not export internal implementation details", async () => {
    const useTraceExports = await import("@src/index.js");
    const internalExports = [
      "traceEnter",
      "traceExit",
      "traceLogFn",
      "areHookInputsEqual",
      "isRefObject",
      "useObjectChangeTracker",
    ];

    internalExports.forEach((exportName) => {
      expect(useTraceExports).not.toHaveProperty(exportName);
    });
  });

  it("should be able to call reactTracer functions", async () => {
    const useTraceExports = await import("@src/index.js");

    expect(() => {
      const initialized = useTraceExports.isReactTracerInitialized();
      expect(typeof initialized).toBe("boolean");
    }).not.toThrow();

    expect(() => {
      useTraceExports.stopReactTracer();
    }).not.toThrow();

    expect(() => {
      useTraceExports.updateReactTracerOptions({});
    }).not.toThrow();
  });
});
