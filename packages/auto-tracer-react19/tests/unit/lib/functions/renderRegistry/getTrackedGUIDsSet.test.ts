import { describe, expect, it, beforeEach } from "vitest";
import { getTrackedGUIDsSet } from "@src/lib/functions/renderRegistry/getTrackedGUIDsSet.js";

describe("getTrackedGUIDsSet", () => {
  beforeEach(() => {
    // Clean up global state
    if (globalThis.__autoTracerInternal?.sharedComponentRegistry) {
      delete globalThis.__autoTracerInternal.sharedComponentRegistry;
    }
  });

  it("should return a Set", () => {
    const guids = getTrackedGUIDsSet();

    expect(guids).toBeInstanceOf(Set);
  });

  it("should return the same Set on subsequent calls", () => {
    const guids1 = getTrackedGUIDsSet();
    const guids2 = getTrackedGUIDsSet();

    expect(guids1).toBe(guids2);
  });

  it("should return empty Set initially", () => {
    const guids = getTrackedGUIDsSet();

    expect(guids.size).toBe(0);
  });

  it("should allow adding GUIDs to the Set", () => {
    const guids = getTrackedGUIDsSet();
    guids.add("test-guid-1");
    guids.add("test-guid-2");

    expect(guids.size).toBe(2);
    expect(guids.has("test-guid-1")).toBe(true);
    expect(guids.has("test-guid-2")).toBe(true);
  });

  it("should persist GUIDs across calls", () => {
    const guids1 = getTrackedGUIDsSet();
    guids1.add("persistent-guid");

    const guids2 = getTrackedGUIDsSet();

    expect(guids2.has("persistent-guid")).toBe(true);
  });
});
