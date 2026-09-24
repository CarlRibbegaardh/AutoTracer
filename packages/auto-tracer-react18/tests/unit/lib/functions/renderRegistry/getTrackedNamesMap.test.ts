import { describe, expect, it, beforeEach } from "vitest";
import { getTrackedNamesMap } from "@src/lib/functions/renderRegistry/getTrackedNamesMap.js";

describe("getTrackedNamesMap", () => {
  beforeEach(() => {
    // Clean up global state
    if (globalThis.__autoTracerInternal?.sharedComponentRegistry) {
      delete globalThis.__autoTracerInternal.sharedComponentRegistry;
    }
  });

  it("should return a Map", () => {
    const names = getTrackedNamesMap();

    expect(names).toBeInstanceOf(Map);
  });

  it("should return the same Map on subsequent calls", () => {
    const names1 = getTrackedNamesMap();
    const names2 = getTrackedNamesMap();

    expect(names1).toBe(names2);
  });

  it("should return empty Map initially", () => {
    const names = getTrackedNamesMap();

    expect(names.size).toBe(0);
  });

  it("should allow adding name mappings", () => {
    const names = getTrackedNamesMap();
    names.set("guid-1", "ComponentA");
    names.set("guid-2", "ComponentB");

    expect(names.size).toBe(2);
    expect(names.get("guid-1")).toBe("ComponentA");
    expect(names.get("guid-2")).toBe("ComponentB");
  });

  it("should persist mappings across calls", () => {
    const names1 = getTrackedNamesMap();
    names1.set("persistent-guid", "PersistentComponent");

    const names2 = getTrackedNamesMap();

    expect(names2.get("persistent-guid")).toBe("PersistentComponent");
  });
});
