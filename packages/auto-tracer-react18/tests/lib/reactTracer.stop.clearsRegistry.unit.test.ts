import { beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";

// Failing test (TDD): stopReactTracer() should clear registries once.

describe("stopReactTracer - clears registries", () => {
  beforeEach(async () => {
    const { clearRenderRegistry } = await import(
      "@src/lib/functions/renderRegistry.js"
    );
    clearRenderRegistry();
    // Provide DevTools hook so initialization succeeds
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis.window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = { onCommitFiberRoot: () => {} };
  });

  it("clears tracked GUIDs and logs after stop", async () => {
    const { reactTracer, stopReactTracer } = await import("@src/lib/reactTracer.js");
    const { useReactTracer } = await import("@src/lib/hooks/useReactTracer.js");
    const { getTrackedGUIDs } = await import("@src/lib/functions/renderRegistry.js");
    const { componentLogRegistry } = await import("@src/lib/functions/componentLogRegistry.js");

    reactTracer({ enabled: true });

    // Create two component instances and log
    renderHook(() => {
      const logger = useReactTracer();
      logger.log("first");
    });
    renderHook(() => {
      const logger = useReactTracer();
      logger.log("second");
    });

    expect(getTrackedGUIDs().size).toBe(2);
    expect(componentLogRegistry.getLogCount()).toBeGreaterThanOrEqual(2);

    // Stop tracer
    stopReactTracer();

    // After stopping, registries should be cleared by implementation
    expect(getTrackedGUIDs().size).toBe(0);
    expect(componentLogRegistry.getLogCount()).toBe(0);
  });
});
