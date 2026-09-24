import { beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";

// Spec: toggling enabled true->false while initialized prevents further collection

describe("useReactTracer - toggle enabled true→false while initialized", () => {
  beforeEach(async () => {
    const { clearRenderRegistry } = await import(
      "@src/lib/functions/renderRegistry.js"
    );
    clearRenderRegistry();
    // Fake DevTools hook for successful initialization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis.window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      onCommitFiberRoot: () => {},
    };
  });

  it("auto-stops and clears GUIDs after disabling", async () => {
    const { reactTracer, updateReactTracerOptions } = await import(
      "@src/lib/reactTracer.js"
    );
    const { useReactTracer } = await import(
      "@src/lib/hooks/useReactTracer.js"
    );
    const { getTrackedGUIDs } = await import(
      "@src/lib/functions/renderRegistry.js"
    );

    // Initialize tracer in active mode.
    reactTracer({ enabled: true });

    // First component render collects one GUID
    renderHook(() => {return useReactTracer()});
    expect(getTrackedGUIDs().size).toBe(1);
    const initialGuids = Array.from(getTrackedGUIDs());

    // Disable tracing at runtime — stopReactTracer clears the registry
    updateReactTracerOptions({ enabled: false });
    expect(getTrackedGUIDs().size).toBe(0); // cleared immediately on stop

    // Subsequent renders always re-register the GUID (passive start-trigger support),
    // but do not produce logs.
    renderHook(() => {return useReactTracer()});

    expect(getTrackedGUIDs().size).toBe(1); // re-registered by next render
    const { componentLogRegistry } = await import("@src/lib/functions/componentLogRegistry.js");
    expect(componentLogRegistry.getLogCount()).toBe(0); // no logs while inactive
  });
});
