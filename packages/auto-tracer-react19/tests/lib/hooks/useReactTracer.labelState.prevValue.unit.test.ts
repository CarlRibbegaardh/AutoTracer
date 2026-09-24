import { beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";

// Spec: labelState should store prevValue for next render

describe("useReactTracer - labelState stores prevValue", () => {
  beforeEach(async () => {
    const { clearRenderRegistry } = await import(
      "@src/lib/functions/renderRegistry.js"
    );
    const { clearAllHookLabels } = await import(
      "@src/lib/functions/hookLabels/registry/index.js"
    );
    clearRenderRegistry();
    clearAllHookLabels();

    // Provide a fake React DevTools global hook so initialization succeeds
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis.window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      onCommitFiberRoot: () => {},
    };
    const { reactTracer } = await import("@src/lib/reactTracer.js");
    reactTracer({ enabled: true, internalLogLevel: "error" });
  });

  it("should store prevValue as undefined on first render", async () => {
    const { useReactTracer } = await import(
      "@src/lib/hooks/useReactTracer.js"
    );
    const { getLabelsForGuid } = await import(
      "@src/lib/functions/hookLabels/registry/index.js"
    );
    const { getTrackedGUIDs } = await import(
      "@src/lib/functions/renderRegistry.js"
    );

    renderHook(() => {
      const logger = useReactTracer();
      logger.labelState(0, "count", 5);
      return logger;
    });

    // Get the GUID that was registered
    const guids = Array.from(getTrackedGUIDs());
    expect(guids.length).toBe(1);
    const guid = guids[0]!;

    // Check the label
    const labels = getLabelsForGuid(guid);
    expect(labels.length).toBe(1);
    expect(labels[0]!.label).toBe("count");
    expect(labels[0]!.value).toBe(5);
    expect(labels[0]!.prevValue).toBeUndefined();
  });

  it("should store prevValue from previous render", async () => {
    const { useReactTracer } = await import(
      "@src/lib/hooks/useReactTracer.js"
    );
    const { getLabelsForGuid } = await import(
      "@src/lib/functions/hookLabels/registry/index.js"
    );
    const { getTrackedGUIDs } = await import(
      "@src/lib/functions/renderRegistry.js"
    );

    // First render with count=5
    const { rerender } = renderHook(
      ({ count }) => {
        const logger = useReactTracer();
        logger.labelState(0, "count", count);
        return logger;
      },
      { initialProps: { count: 5 } }
    );

    // Get the GUID
    const guids = Array.from(getTrackedGUIDs());
    expect(guids.length).toBe(1);
    const guid = guids[0]!;

    // First render: prevValue should be undefined
    let labels = getLabelsForGuid(guid);
    expect(labels[0]!.value).toBe(5);
    expect(labels[0]!.prevValue).toBeUndefined();

    // Second render with count=10
    rerender({ count: 10 });

    // Second render: prevValue should be 5
    labels = getLabelsForGuid(guid);
    expect(labels[0]!.value).toBe(10);
    expect(labels[0]!.prevValue).toBe(5);
  });

  it("should handle multiple state variables independently", async () => {
    const { useReactTracer } = await import(
      "@src/lib/hooks/useReactTracer.js"
    );
    const { getLabelsForGuid } = await import(
      "@src/lib/functions/hookLabels/registry/index.js"
    );
    const { getTrackedGUIDs } = await import(
      "@src/lib/functions/renderRegistry.js"
    );

    // First render
    const { rerender } = renderHook(
      ({ count, name }) => {
        const logger = useReactTracer();
        logger.labelState(0, "count", count);
        logger.labelState(1, "name", name);
        return logger;
      },
      { initialProps: { count: 1, name: "Alice" } }
    );

    const guid = Array.from(getTrackedGUIDs())[0]!;

    // Second render - change only count
    rerender({ count: 2, name: "Alice" });

    const labels = getLabelsForGuid(guid);
    const countLabel = labels.find((l) => {
      return l.label === "count";
    });
    const nameLabel = labels.find((l) => {
      return l.label === "name";
    });

    expect(countLabel?.value).toBe(2);
    expect(countLabel?.prevValue).toBe(1);
    expect(nameLabel?.value).toBe("Alice");
    expect(nameLabel?.prevValue).toBe("Alice");
  });

  it("should handle object values", async () => {
    const { useReactTracer } = await import(
      "@src/lib/hooks/useReactTracer.js"
    );
    const { getLabelsForGuid } = await import(
      "@src/lib/functions/hookLabels/registry/index.js"
    );
    const { getTrackedGUIDs } = await import(
      "@src/lib/functions/renderRegistry.js"
    );

    const obj1 = { x: 1 };
    const obj2 = { x: 2 };

    // First render
    const { rerender } = renderHook(
      ({ data }) => {
        const logger = useReactTracer();
        logger.labelState(0, "data", data);
        return logger;
      },
      { initialProps: { data: obj1 } }
    );

    const guid = Array.from(getTrackedGUIDs())[0];

    // Second render with different object
    rerender({ data: obj2 });

    const labels = getLabelsForGuid(guid!);
    expect(labels[0]!.value).toBe(obj2);
    expect(labels[0]!.prevValue).toBe(obj1);
  });
});
