import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, renderHook } from "@testing-library/react";

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
});
