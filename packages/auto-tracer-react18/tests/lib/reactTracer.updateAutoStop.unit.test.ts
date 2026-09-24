import { beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";

// Failing test (TDD): updateReactTracerOptions({ enabled:false }) auto-stops when previously active.

describe("updateReactTracerOptions - enabled true→false triggers auto-stop", () => {
  beforeEach(async () => {
    const { clearRenderRegistry } = await import(
      "@src/lib/functions/renderRegistry.js"
    );
    clearRenderRegistry();
    // Provide DevTools hook so initialization succeeds
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis.window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = { onCommitFiberRoot: () => {} };
  });

  it("disables tracer and clears registries on enabled:false update", async () => {
    const { reactTracer, updateReactTracerOptions, isReactTracerInitialized } = await import("@src/lib/reactTracer.js");
    const { useReactTracer } = await import("@src/lib/hooks/useReactTracer.js");
    const { getTrackedGUIDs } = await import("@src/lib/functions/renderRegistry.js");

    reactTracer({ enabled: true });
    expect(isReactTracerInitialized()).toBe(true);

    // Render components to populate registry
    renderHook(() => {return useReactTracer()});
    renderHook(() => {return useReactTracer()});
    expect(getTrackedGUIDs().size).toBe(2);

    // Disable tracing at runtime
    updateReactTracerOptions({
      enabled: false,
      internalLogLevel: "debug" as const,
    });

    // Should be deactivated
    expect(isReactTracerInitialized()).toBe(false);
    // Registries should be cleared
    expect(getTrackedGUIDs().size).toBe(0);
  });
});
