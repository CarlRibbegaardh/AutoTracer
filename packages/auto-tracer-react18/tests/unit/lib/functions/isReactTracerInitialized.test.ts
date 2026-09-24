import { describe, expect, it, beforeEach } from "vitest";
import { isReactTracerInitialized } from "@src/lib/functions/isReactTracerInitialized.js";

describe("isReactTracerInitialized", () => {
  beforeEach(() => {
    // Clean up global state
    if (globalThis.__autoTracerInternal?.sharedControl) {
      delete globalThis.__autoTracerInternal.sharedControl;
    }
  });

  it("should return false when tracer is not active", () => {
    const result = isReactTracerInitialized();

    expect(result).toBe(false);
  });

  it("should return true when tracer is active", () => {
    // Manually set up state
    if (!globalThis.__autoTracerInternal) {
      globalThis.__autoTracerInternal = {
        outputMode: "devtools",
        subscribers: [],
      };
    }
    globalThis.__autoTracerInternal.sharedControl = {
      isReactTracerActive: true,
      isPassiveHookInstalled: false,
      isIntendedToBeEnabled: true,
      hasInitializedOnce: false,
      originalOnCommitFiberRoot: null,
    };

    const result = isReactTracerInitialized();

    expect(result).toBe(true);
  });

  it("should return false when passive hook installed but not active", () => {
    if (!globalThis.__autoTracerInternal) {
      globalThis.__autoTracerInternal = {
        outputMode: "devtools",
        subscribers: [],
      };
    }
    globalThis.__autoTracerInternal.sharedControl = {
      isReactTracerActive: false,
      isPassiveHookInstalled: true,
      isIntendedToBeEnabled: false,
      hasInitializedOnce: false,
      originalOnCommitFiberRoot: {},
    };

    const result = isReactTracerInitialized();

    expect(result).toBe(false);
  });
});
