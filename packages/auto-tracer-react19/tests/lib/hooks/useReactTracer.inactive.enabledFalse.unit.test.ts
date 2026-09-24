import { beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";

// Spec: enabled=false & not initialized => GUID is always registered (for passive start-trigger support)
// but all log calls are no-ops.

describe("useReactTracer - inactive when enabled=false and not initialized", () => {
  beforeEach(async () => {
    const { clearRenderRegistry } = await import(
      "@src/lib/functions/renderRegistry.js"
    );
    clearRenderRegistry();
    // Explicitly set enabled:false; do not initialize tracer
    const { updateReactTracerOptions } = await import(
      "@src/lib/reactTracer.js"
    );
    updateReactTracerOptions({ enabled: false });
  });

  it("returns no-op logger and does not collect GUIDs or logs", async () => {
    const { useReactTracer } = await import(
      "@src/lib/hooks/useReactTracer.js"
    );
    const { getTrackedGUIDs } = await import(
      "@src/lib/functions/renderRegistry.js"
    );
    const { componentLogRegistry } = await import(
      "@src/lib/functions/componentLogRegistry.js"
    );

    const { result } = renderHook(() => {return useReactTracer()});

    const logger = result.current;
    // Should be safe to call methods (no-ops)
    logger.log("inactive-test");
    logger.warn("inactive-warn");
    logger.error("inactive-error");
    logger.labelState(0, "label", 123);

    // GUID is always registered regardless of active state so that buildTreeFromFiber
    // (with includeNonTrackedBranches: false) can find tracked components when a start
    // trigger fires during passive mode.
    expect(getTrackedGUIDs().size).toBe(1);
    expect(componentLogRegistry.getLogCount()).toBe(0);
  });
});
