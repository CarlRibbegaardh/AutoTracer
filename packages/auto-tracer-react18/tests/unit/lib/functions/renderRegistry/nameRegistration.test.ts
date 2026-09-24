import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

// Mock dependencies
vi.mock("@src/lib/functions/componentLogRegistry.js", () => {
  return {
    componentLogRegistry: {
      addLog: vi.fn(),
      clear: vi.fn(),
    },
  };
});

describe("Render Registry Name Registration", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { clearRenderRegistry } = await import(
      "@src/lib/functions/renderRegistry.js"
    );
    clearRenderRegistry();

    // Initialize tracer for tests that depend on active behavior
    // Provide a fake React DevTools global hook so initialization succeeds
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis.window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      onCommitFiberRoot: () => {},
    };
    const { reactTracer } = await import("@src/lib/reactTracer.js");
    reactTracer({ enabled: true, internalLogLevel: "error" });
  });

  it("should register a component name when provided to registerTrackedGUID", async () => {
    const { registerTrackedGUID, getTrackedName } = await import(
      "@src/lib/functions/renderRegistry.js"
    );

    const guid = "test-guid-123";
    const name = "TestComponent";

    registerTrackedGUID(guid, name);

    expect(getTrackedName(guid)).toBe(name);
  });

  it("should return undefined for a GUID with no registered name", async () => {
    const { registerTrackedGUID, getTrackedName } = await import(
      "@src/lib/functions/renderRegistry.js"
    );

    const guid = "test-guid-456";
    registerTrackedGUID(guid);

    expect(getTrackedName(guid)).toBeUndefined();
  });

  it("should register component name via useReactTracer hook", async () => {
    const { useReactTracer } = await import("@src/lib/hooks/useReactTracer.js");
    const { getTrackedGUIDs, getTrackedName } = await import(
      "@src/lib/functions/renderRegistry.js"
    );

    const componentName = "MyTrackedComponent";

    renderHook(() => {
      useReactTracer({ name: componentName });
    });

    const guids = getTrackedGUIDs();
    expect(guids.size).toBe(1);
    const guid = Array.from(guids)[0];
    expect(guid).toBeDefined();

    const trackedName = getTrackedName(guid!);
    expect(trackedName).toBeDefined();
    expect(trackedName).toBe(componentName);
  });
});
