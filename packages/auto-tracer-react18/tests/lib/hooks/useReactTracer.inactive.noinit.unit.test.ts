import { beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";

describe("useReactTracer - inactive when not initialized (enabled=true)", () => {
  beforeEach(async () => {
    // Ensure any registries are cleared between tests
    const { clearRenderRegistry } = await import(
      "@src/lib/functions/renderRegistry.js"
    );
    clearRenderRegistry();

    // Ensure options are at defaults (enabled=true by default)
    const { updateReactTracerOptions } = await import(
      "@src/lib/reactTracer.js"
    );
    updateReactTracerOptions({});
  });

  it("does not collect GUIDs or logs when tracer not initialized", async () => {
    const { useReactTracer } = await import(
      "@src/lib/hooks/useReactTracer.js"
    );
    const { getTrackedGUIDs } = await import(
      "@src/lib/functions/renderRegistry.js"
    );
    const { componentLogRegistry } = await import(
      "@src/lib/functions/componentLogRegistry.js"
    );

    // Render a hook caller without initializing the tracer
    const { result } = renderHook(() => {
      return useReactTracer();
    });

    // Use the logger to ensure no-ops don't throw
    const logger = result.current;
    logger.log("test");
    logger.warn("warn");
    logger.error("error");
    logger.labelState(0, "x", 1);

    // GUID is always registered regardless of active state so that buildTreeFromFiber
    // (with includeNonTrackedBranches: false) can find tracked components when a start
    // trigger fires during passive mode.
    expect(getTrackedGUIDs().size).toBe(1);
    expect(componentLogRegistry.getLogCount()).toBe(0);
  });
});
