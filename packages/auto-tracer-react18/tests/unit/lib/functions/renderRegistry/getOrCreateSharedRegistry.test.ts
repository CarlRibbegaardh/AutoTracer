import { describe, expect, it, beforeEach } from "vitest";
import { getOrCreateSharedRegistry } from "@src/lib/functions/renderRegistry/getOrCreateSharedRegistry.js";

describe("getOrCreateSharedRegistry", () => {
  beforeEach(() => {
    // Clean up global state
    if (globalThis.__autoTracerInternal?.sharedComponentRegistry) {
      delete globalThis.__autoTracerInternal.sharedComponentRegistry;
    }
  });

  it("should create shared registry if it does not exist", () => {
    const registry = getOrCreateSharedRegistry();

    expect(registry).toBeDefined();
    expect(registry.trackedGUIDs).toBeInstanceOf(Set);
    expect(registry.trackedNames).toBeInstanceOf(Map);
  });

  it("should return same registry on subsequent calls", () => {
    const registry1 = getOrCreateSharedRegistry();
    const registry2 = getOrCreateSharedRegistry();

    expect(registry1).toBe(registry2);
  });

  it("should initialize with empty Set and Map", () => {
    const registry = getOrCreateSharedRegistry();

    expect(registry.trackedGUIDs.size).toBe(0);
    expect(registry.trackedNames.size).toBe(0);
  });

  it("should preserve existing data across calls", () => {
    const registry1 = getOrCreateSharedRegistry();
    registry1.trackedGUIDs.add("test-guid");
    registry1.trackedNames.set("test-guid", "TestComponent");

    const registry2 = getOrCreateSharedRegistry();

    expect(registry2.trackedGUIDs.has("test-guid")).toBe(true);
    expect(registry2.trackedNames.get("test-guid")).toBe("TestComponent");
  });

  it("should create __autoTracerInternal if it does not exist", () => {
    delete (globalThis as any).__autoTracerInternal;

    getOrCreateSharedRegistry();

    expect(globalThis.__autoTracerInternal).toBeDefined();
    expect(globalThis.__autoTracerInternal?.outputMode).toBe("devtools");
  });
});
