import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { reactTracer } from "@src/lib/reactTracer.js";
import { getOrCreateSharedControl } from "@src/lib/functions/getOrCreateSharedControl.js";

/**
 * Test passive-to-active promotion: reactTracer({ enabled: false }) then .start()
 *
 * This reproduces the multi-island bug where Start button doesn't work.
 */
describe("reactTracer passive-to-active promotion", () => {
  let mockDevToolsHook: any;
  let installedHook: any;

  beforeEach(() => {
    // Clean up global state
    delete (globalThis as any).__autoTracerInternal;
    delete (globalThis as any).autoTracer;

    // Create mock DevTools hook
    mockDevToolsHook = {
      supportsFiber: true,
      renderers: new Map(),
      onCommitFiberRoot: vi.fn(),
      onCommitFiberUnmount: vi.fn(),
      inject: vi.fn(),
    };
    (globalThis as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockDevToolsHook;

    installedHook = null;
  });

  afterEach(() => {
    delete (globalThis as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
    delete (globalThis as any).__autoTracerInternal;
    delete (globalThis as any).autoTracer;
  });

  it("should install passive hook when enabled: false", () => {
    const originalHook = mockDevToolsHook.onCommitFiberRoot;

    reactTracer({ enabled: false });

    const sharedControl = getOrCreateSharedControl();

    expect(sharedControl.isPassiveHookInstalled).toBe(true);
    expect(sharedControl.isReactTracerActive).toBe(false);
    expect(sharedControl.isIntendedToBeEnabled).toBe(false);
    expect(mockDevToolsHook.onCommitFiberRoot).not.toBe(originalHook); // Hook was replaced
  });

  it("should promote passive hook to active when .start() is called", () => {
    reactTracer({ enabled: false });

    const sharedControl = getOrCreateSharedControl();
    expect(sharedControl.isPassiveHookInstalled).toBe(true);
    expect(sharedControl.isReactTracerActive).toBe(false);

    // Store the hook that was installed
    const passiveHook = mockDevToolsHook.onCommitFiberRoot;

    // Call start via global API
    (globalThis as any).autoTracer.reactTracer.start();

    expect(sharedControl.isPassiveHookInstalled).toBe(false);
    expect(sharedControl.isReactTracerActive).toBe(true);
    expect(sharedControl.isIntendedToBeEnabled).toBe(true);

    // Hook should still be the same function (not replaced)
    expect(mockDevToolsHook.onCommitFiberRoot).toBe(passiveHook);
  });
});
