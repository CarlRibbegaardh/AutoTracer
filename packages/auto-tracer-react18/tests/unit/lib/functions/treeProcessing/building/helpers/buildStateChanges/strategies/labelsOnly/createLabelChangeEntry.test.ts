import { beforeEach, describe, expect, it, vi } from "vitest";
import { createLabelChangeEntry } from "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges/strategies/labelsOnly/createLabelChangeEntry";

describe("createLabelChangeEntry", () => {
  beforeEach(async () => {
    vi.resetModules();
  });

  it("returns null when label not in previous map", () => {
    const prevMap = new Map<string, unknown>();
    const result = createLabelChangeEntry("newLabel", "value", prevMap);
    expect(result).toBeNull();
  });

  it("returns null when value unchanged (same reference)", () => {
    const value = { data: "test" };
    const prevMap = new Map([["state", value]]);

    const result = createLabelChangeEntry("state", value, prevMap);

    expect(result).toBeNull();
  });

  it("returns entry when primitive value changed", () => {
    const prevMap = new Map([["count", 5]]);

    const result = createLabelChangeEntry("count", 10, prevMap);

    expect(result).not.toBeNull();
    expect(result?.name).toBe("count");
    expect(result?.value).toBe(10);
    expect(result?.prevValue).toBe(5);
    expect(result?.hook).toBeNull();
    expect(result?.isIdenticalValueChange).toBe(false);
  });

  it("returns entry when object reference changed", () => {
    const prevObj = { count: 5 };
    const newObj = { count: 10 };
    const prevMap = new Map([["state", prevObj]]);

    const result = createLabelChangeEntry("state", newObj, prevMap);

    expect(result).not.toBeNull();
    expect(result?.name).toBe("state");
    expect(result?.value).toBe(newObj);
    expect(result?.prevValue).toBe(prevObj);
    expect(result?.hook).toBeNull();
  });

  it("sets hook to null for labels-only strategy", () => {
    const prevMap = new Map([["value", "old"]]);

    const result = createLabelChangeEntry("value", "new", prevMap);

    expect(result?.hook).toBeNull();
  });

  it("detects identical value change when enabled", async () => {
    vi.resetModules();
    // Enable identical value detection
    const { setTracerOptions } = await import("@src/lib/types/globalState.js");
    setTracerOptions({ detectIdenticalValueChanges: true });

    // Re-import after setting options
    const { createLabelChangeEntry: createEntry } = await import(
      "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges/strategies/labelsOnly/createLabelChangeEntry.js"
    );

    const prevObj = { count: 5 };
    const newObj = { count: 5 }; // Same structure, different reference
    const prevMap = new Map([["state", prevObj]]);

    const result = createEntry("state", newObj, prevMap);

    expect(result).not.toBeNull();
    expect(result?.isIdenticalValueChange).toBe(true);
  });

  it("does not detect identical value change when disabled", async () => {
    vi.resetModules();
    // Disable identical value detection
    const { setTracerOptions } = await import("@src/lib/types/globalState.js");
    setTracerOptions({ detectIdenticalValueChanges: false });

    // Re-import after setting options
    const { createLabelChangeEntry: createEntry } = await import(
      "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges/strategies/labelsOnly/createLabelChangeEntry.js"
    );

    const prevObj = { count: 5 };
    const newObj = { count: 5 }; // Same structure, different reference
    const prevMap = new Map([["state", prevObj]]);

    const result = createEntry("state", newObj, prevMap);

    expect(result).not.toBeNull();
    expect(result?.isIdenticalValueChange).toBe(false);
  });

  it("handles string values correctly", () => {
    const prevMap = new Map([["message", "Hello"]]);

    const result = createLabelChangeEntry("message", "World", prevMap);

    expect(result).not.toBeNull();
    expect(result?.value).toBe("World");
    expect(result?.prevValue).toBe("Hello");
  });

  it("handles null and undefined values", () => {
    const prevMap = new Map([
      ["nullable", null],
      ["optional", undefined],
    ]);

    const result1 = createLabelChangeEntry("nullable", "value", prevMap);
    const result2 = createLabelChangeEntry("optional", "value", prevMap);

    expect(result1).not.toBeNull();
    expect(result1?.prevValue).toBeNull();

    expect(result2).not.toBeNull();
    expect(result2?.prevValue).toBeUndefined();
  });
});
