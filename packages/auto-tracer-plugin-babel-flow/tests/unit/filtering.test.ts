import { describe, it, expect } from "vitest";
import { shouldInstrumentFunction } from "../../src/helpers";
import { shouldProcessFile } from "../../src/shouldProcessFile";

describe("shouldProcessFile", () => {
  it("should process all files when no patterns specified", () => {
    expect(shouldProcessFile("src/app.ts")).toBe(true);
    expect(shouldProcessFile("src/components/Button.tsx")).toBe(true);
  });

  it("should exclude files matching exclude patterns", () => {
    const exclude = { paths: ["**/*.test.ts", "**/*.spec.ts"] };

    expect(shouldProcessFile("src/app.test.ts", undefined, exclude)).toBe(false);
    expect(shouldProcessFile("src/utils/helper.spec.ts", undefined, exclude)).toBe(false);
    expect(shouldProcessFile("src/app.ts", undefined, exclude)).toBe(true);
  });

  it("should only process files matching include patterns", () => {
    const include = { paths: ["src/components/**"] };

    expect(shouldProcessFile("src/components/Button.tsx", include)).toBe(true);
    expect(shouldProcessFile("src/components/forms/Input.tsx", include)).toBe(true);
    expect(shouldProcessFile("src/utils/helper.ts", include)).toBe(false);
  });

  it("should prioritize exclude over include", () => {
    const include = { paths: ["src/**"] };
    const exclude = { paths: ["**/*.test.ts"] };

    expect(shouldProcessFile("src/app.ts", include, exclude)).toBe(true);
    expect(shouldProcessFile("src/app.test.ts", include, exclude)).toBe(false);
  });

  it("should handle cross-platform path separators", () => {
    const include = { paths: ["src/components/**"] };

    // Windows path
    expect(shouldProcessFile("src\\components\\Button.tsx", include)).toBe(true);
    // Unix path
    expect(shouldProcessFile("src/components/Button.tsx", include)).toBe(true);
  });
});

describe("shouldInstrumentFunction", () => {
  it("should instrument all functions when no patterns specified", () => {
    expect(shouldInstrumentFunction("handleClick")).toBe(true);
    expect(shouldInstrumentFunction("fetchData")).toBe(true);
  });

  it("should exclude anonymous functions when include patterns specified", () => {
    const include = { functions: ["handle*"] };

    expect(shouldInstrumentFunction("anonymous", include)).toBe(false);
  });

  it("should exclude functions matching exclude patterns", () => {
    const exclude = { functions: ["render", "_*", /^use[A-Z]/] };

    expect(shouldInstrumentFunction("render", undefined, exclude)).toBe(false);
    expect(shouldInstrumentFunction("_private", undefined, exclude)).toBe(false);
    expect(shouldInstrumentFunction("useState", undefined, exclude)).toBe(false);
    expect(shouldInstrumentFunction("handleClick", undefined, exclude)).toBe(true);
  });

  it("should only instrument functions matching include patterns", () => {
    const include = { functions: ["handle*", "on*"] };

    expect(shouldInstrumentFunction("handleClick", include)).toBe(true);
    expect(shouldInstrumentFunction("onClick", include)).toBe(true);
    expect(shouldInstrumentFunction("fetchData", include)).toBe(false);
  });

  it("should support regex patterns", () => {
    const include = { functions: [/^handle[A-Z]/, /.*Async$/] };

    expect(shouldInstrumentFunction("handleClick", include)).toBe(true);
    expect(shouldInstrumentFunction("fetchAsync", include)).toBe(true);
    expect(shouldInstrumentFunction("handle", include)).toBe(false);
    expect(shouldInstrumentFunction("onClick", include)).toBe(false);
  });

  it("should support exact string matches", () => {
    const include = { functions: ["handleClick", "handleSubmit"] };

    expect(shouldInstrumentFunction("handleClick", include)).toBe(true);
    expect(shouldInstrumentFunction("handleSubmit", include)).toBe(true);
    expect(shouldInstrumentFunction("handleChange", include)).toBe(false);
  });

  it("should prioritize exclude over include", () => {
    const include = { functions: ["handle*"] };
    const exclude = { functions: ["handleError"] };

    expect(shouldInstrumentFunction("handleClick", include, exclude)).toBe(true);
    expect(shouldInstrumentFunction("handleError", include, exclude)).toBe(false);
  });

  it("should support glob patterns", () => {
    const include = { functions: ["*Async", "fetch*"] };

    expect(shouldInstrumentFunction("fetchData", include)).toBe(true);
    expect(shouldInstrumentFunction("fetchAsync", include)).toBe(true);
    expect(shouldInstrumentFunction("processAsync", include)).toBe(true);
    expect(shouldInstrumentFunction("handleClick", include)).toBe(false);
  });

  it("should filter nested functions by base name only", () => {
    const include = { functions: ["handle*", "calculate*"] };

    // For simple nesting without hooks, use the last segment (the actual function name)
    expect(shouldInstrumentFunction("App:handleClick", include)).toBe(true);
    expect(shouldInstrumentFunction("outer:inner:handleSubmit", include)).toBe(true);
    expect(shouldInstrumentFunction("Calculator:calculateTotal", include)).toBe(true);

    // Should not match if final function name doesn't match
    expect(shouldInstrumentFunction("App:fetchData", include)).toBe(false);
    expect(shouldInstrumentFunction("outer:inner:onClick", include)).toBe(false);
  });

  it("should exclude nested functions by base name", () => {
    const exclude = { functions: ["handleError", "_*"] };

    // Should exclude nested functions if base name matches
    expect(shouldInstrumentFunction("App:handleError", undefined, exclude)).toBe(false);
    expect(shouldInstrumentFunction("Component:_private", undefined, exclude)).toBe(false);

    // Should not exclude if base name doesn't match
    expect(shouldInstrumentFunction("App:handleClick", undefined, exclude)).toBe(true);
    expect(shouldInstrumentFunction("Component:onClick", undefined, exclude)).toBe(true);
  });

  it("should handle nested anonymous functions correctly", () => {
    const include = { functions: ["handle*"] };

    // Nested anonymous should be excluded when include patterns specified
    expect(shouldInstrumentFunction("App:anonymous", include)).toBe(false);
    expect(shouldInstrumentFunction("outer:inner:anonymous", include)).toBe(false);

    // But should be included when no include patterns
    expect(shouldInstrumentFunction("App:anonymous")).toBe(true);
  });

  it("should filter useCallback/useMemo by variable name, not hook name", () => {
    const include = { functions: ["handle*"] };

    // Should match based on variable name "handleClick", not "useCallback" or "anonymous"
    expect(shouldInstrumentFunction("App:handleClick:useCallback:anonymous", include)).toBe(true);
    expect(shouldInstrumentFunction("Component:handleSubmit:useCallback:anonymous", include)).toBe(true);

    // Should not match if variable name doesn't match
    expect(shouldInstrumentFunction("App:onClick:useCallback:anonymous", include)).toBe(false);
    expect(shouldInstrumentFunction("Component:value:useMemo:anonymous", include)).toBe(false);

    // Direct useCallback without variable should be excluded (anonymous)
    expect(shouldInstrumentFunction("App:useCallback:anonymous", include)).toBe(false);
  });

  it("should filter map/filter callbacks by variable name", () => {
    const include = { functions: ["result*"] };

    // Should match based on variable name
    expect(shouldInstrumentFunction("processData:results:map:anonymous", include)).toBe(true);
    expect(shouldInstrumentFunction("fn:resultSet:filter:anonymous", include)).toBe(true);

    // Should not match if variable name doesn't match
    expect(shouldInstrumentFunction("processData:items:map:anonymous", include)).toBe(false);
  });
});
