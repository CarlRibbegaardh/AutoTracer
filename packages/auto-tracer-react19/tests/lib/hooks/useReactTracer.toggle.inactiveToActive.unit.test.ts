import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, renderHook } from "@testing-library/react";
import { createElement, useState } from "react";

// Spec: a mounted component should start collecting labels after tracing is re-enabled

describe("useReactTracer - toggle inactive→active for mounted component", () => {
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

    const { reactTracer, stopReactTracer } = await import(
      "@src/lib/reactTracer.js"
    );
    reactTracer({ enabled: true, internalLogLevel: "error" });
    stopReactTracer();
  });

  afterEach(() => {
    cleanup();
  });

  it("collects labels after tracing starts for an already mounted component", async () => {
    const { useReactTracer } = await import(
      "@src/lib/hooks/useReactTracer.js"
    );
    const { getTrackedGUIDs } = await import(
      "@src/lib/functions/renderRegistry.js"
    );
    const { getLabelsForGuid } = await import(
      "@src/lib/functions/hookLabels/registry/index.js"
    );

    const { rerender } = renderHook(
      ({ count }) => {
        const logger = useReactTracer();
        logger.labelState(0, "count", count);
        return logger;
      },
      { initialProps: { count: 1 } }
    );

    const guid = Array.from(getTrackedGUIDs())[0]!;
    expect(getLabelsForGuid(guid)).toHaveLength(0);

    const autoTracer = Reflect.get(globalThis, "autoTracer") as
      | {
          reactTracer?: {
            start: () => void;
          };
        }
      | undefined;

    autoTracer?.reactTracer?.start();

    rerender({ count: 2 });

    const labels = getLabelsForGuid(guid);

    expect(labels).toHaveLength(1);
    expect(labels[0]?.label).toBe("count");
    expect(labels[0]?.value).toBe(2);
  });

  it("resolves the first active useState update for an already mounted component", async () => {
    const { useReactTracer } = await import(
      "@src/lib/hooks/useReactTracer.js"
    );
    const { updateReactTracerOptions } = await import(
      "@src/lib/functions/updateReactTracerOptions.js"
    );
    const { buildTreeFromFiber } = await import(
      "@src/lib/functions/treeProcessing/building/buildTreeFromFiber.js"
    );

    updateReactTracerOptions({ enabled: false });

    function StateComponent() {
      const logger = useReactTracer({ name: "StateComponent" });
      const [count, setCount] = useState(0);
      logger.labelState(0, "count", count, "setCount", setCount);

      return createElement(
        "button",
        { type: "button", onClick: () => setCount((value) => value + 1) },
        count,
      );
    }

    const view = render(createElement(StateComponent));
    const rootProperty = Object.getOwnPropertyNames(view.container).find(
      (property) => property.startsWith("__reactContainer$"),
    );
    if (rootProperty === undefined) {
      throw new Error("Expected React container fiber property");
    }

    const hostRootFiber = Reflect.get(view.container, rootProperty);
    if (typeof hostRootFiber !== "object" || hostRootFiber === null) {
      throw new Error("Expected React host root fiber");
    }
    const fiberRoot = Reflect.get(hostRootFiber, "stateNode");
    if (typeof fiberRoot !== "object" || fiberRoot === null) {
      throw new Error("Expected React fiber root");
    }

    const autoTracer = Reflect.get(globalThis, "autoTracer");
    if (typeof autoTracer !== "object" || autoTracer === null) {
      throw new Error("Expected AutoTracer global API");
    }
    const reactTracer = Reflect.get(autoTracer, "reactTracer");
    if (typeof reactTracer !== "object" || reactTracer === null) {
      throw new Error("Expected ReactTracer runtime controls");
    }
    const start = Reflect.get(reactTracer, "start");
    if (typeof start !== "function") {
      throw new Error("Expected ReactTracer start control");
    }
    Reflect.apply(start, reactTracer, []);

    fireEvent.click(view.getByRole("button"));

    const currentFiber = Reflect.get(fiberRoot, "current");
    const tree = buildTreeFromFiber(currentFiber, 0);
    const component = tree.find(
      (node) => node.componentName === "StateComponent",
    );

    expect(component?.stateChanges).toEqual([
      expect.objectContaining({ name: "count", prevValue: 0, value: 1 }),
    ]);
  });
});
