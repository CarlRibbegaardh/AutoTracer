import { describe, expect, it, beforeEach } from "vitest";
import { getOrCreateSharedControl } from "@src/lib/functions/getOrCreateSharedControl.js";

describe("getOrCreateSharedControl", () => {
  beforeEach(() => {
    // Clean up global state
    if (globalThis.__autoTracerInternal?.sharedControl) {
      delete globalThis.__autoTracerInternal.sharedControl;
    }
  });

  it("should create shared control if it does not exist", () => {
    const control = getOrCreateSharedControl();

    expect(control).toBeDefined();
    expect(control.isReactTracerActive).toBe(false);
    expect(control.isPassiveHookInstalled).toBe(false);
    expect(control.isIntendedToBeEnabled).toBe(false);
    expect(control.originalOnCommitFiberRoot).toBeNull();
  });

  it("should return same control object on subsequent calls", () => {
    const control1 = getOrCreateSharedControl();
    const control2 = getOrCreateSharedControl();

    expect(control1).toBe(control2);
  });

  it("should preserve state across calls", () => {
    const control1 = getOrCreateSharedControl();
    control1.isReactTracerActive = true;
    control1.isPassiveHookInstalled = true;

    const control2 = getOrCreateSharedControl();

    expect(control2.isReactTracerActive).toBe(true);
    expect(control2.isPassiveHookInstalled).toBe(true);
  });

  it("should create __autoTracerInternal if it does not exist", () => {
    delete (globalThis as any).__autoTracerInternal;

    getOrCreateSharedControl();

    expect(globalThis.__autoTracerInternal).toBeDefined();
    expect(globalThis.__autoTracerInternal?.outputMode).toBe("devtools");
  });
});
