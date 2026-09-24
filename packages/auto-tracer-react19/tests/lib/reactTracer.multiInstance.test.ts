import { beforeEach, describe, expect, it, vi } from "vitest";
import { reactTracer } from "@src/lib/reactTracer.js";
import { getOrCreateSharedControl } from "@src/lib/functions/getOrCreateSharedControl.js";

/**
 * Multi-instance scenario test:
 * Simulates islands/microfrontend architecture where multiple modules
 * each call reactTracer() with their own bundled copy of the library.
 */
describe("reactTracer multi-instance (islands/microfrontends)", () => {
  beforeEach(() => {
    // Clean up global state
    if ((globalThis as any).__autoTracerInternal) {
      delete (globalThis as any).__autoTracerInternal;
    }
    if ((globalThis as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      delete (globalThis as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
    }

    // Install minimal DevTools hook
    (globalThis as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      supportsFiber: true,
      renderers: new Map(),
      onCommitFiberRoot: vi.fn(),
      onCommitFiberUnmount: vi.fn(),
      inject: vi.fn((renderer) => {
        const id = Math.random().toString(16).slice(2);
        (globalThis as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers.set(
          id,
          renderer,
        );
        return id;
      }),
    };
  });

  it("should install passive hook when first instance calls reactTracer({ enabled: false })", () => {
    reactTracer({ enabled: false });

    const sharedControl = getOrCreateSharedControl();
    expect(sharedControl.isPassiveHookInstalled).toBe(true);
    expect(sharedControl.isReactTracerActive).toBe(false);
  });

  it("should allow second instance to call reactTracer({ enabled: false }) without error", () => {
    // First instance
    reactTracer({ enabled: false });

    // Second instance (different module, same shared state)
    expect(() => {
      reactTracer({ enabled: false });
    }).not.toThrow();

    const sharedControl = getOrCreateSharedControl();
    expect(sharedControl.isPassiveHookInstalled).toBe(true);
    expect(sharedControl.isReactTracerActive).toBe(false);
  });

  it("should allow runtime .start() to activate tracing after both instances initialized", () => {
    // Island 1 initializes
    reactTracer({ enabled: false });

    // Island 2 initializes
    reactTracer({ enabled: false });

    const sharedControl = getOrCreateSharedControl();
    expect(sharedControl.isPassiveHookInstalled).toBe(true);
    expect(sharedControl.isReactTracerActive).toBe(false);

    // Dashboard calls .start()
    if (globalThis.autoTracer?.reactTracer?.start) {
      globalThis.autoTracer.reactTracer.start();
    }

    // Verify tracing is now active
    expect(sharedControl.isReactTracerActive).toBe(true);
    expect(sharedControl.isPassiveHookInstalled).toBe(false);
  });

  it("should keep hook installed when .stop() is called (to allow restart)", () => {
    reactTracer({ enabled: false });

    if (globalThis.autoTracer?.reactTracer?.start) {
      globalThis.autoTracer.reactTracer.start();
    }

    const sharedControl = getOrCreateSharedControl();
    expect(sharedControl.isReactTracerActive).toBe(true);

    if (globalThis.autoTracer?.reactTracer?.stop) {
      globalThis.autoTracer.reactTracer.stop();
    }

    // After stop, should be back in passive mode (not fully uninstalled)
    expect(sharedControl.isReactTracerActive).toBe(false);
    expect(sharedControl.isPassiveHookInstalled).toBe(true);
  });
});
