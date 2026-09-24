import { describe, expect, it, vi } from "vitest";

describe("globalState default rendering modes", () => {
  it("defaults internal rendering modes to the canonical default outputMode mapping", async () => {
    Reflect.deleteProperty(globalThis, "__autoTracerInternal");
    Reflect.set(globalThis, "autoTracer", undefined);

    vi.resetModules();

    const { traceOptions } = await import("@src/lib/types/globalState.js");

    expect(traceOptions.treeRenderingMode).toBe("group");
    expect(traceOptions.valueRenderingMode).toBe("as-is");
  });
});
