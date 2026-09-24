import { beforeEach, describe, expect, it } from "vitest";
import { buildLabelsOnlyMountStateChanges } from "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges/strategies/labelsOnly/buildLabelsOnlyMountStateChanges";

describe("buildLabelsOnlyMountStateChanges", () => {
  beforeEach(async () => {
    // Clear label registry before each test
    const { clearAllHookLabels } = await import("@src/lib/functions/hookLabels/registry/clearAllHookLabels.js");
    clearAllHookLabels();
  });

  it("returns empty array when no labels registered", async () => {
    const result = buildLabelsOnlyMountStateChanges("guid-123");

    expect(result).toEqual([]);
  });

  it("returns all labeled state on mount", async () => {
    const { addLabelForGuid } = await import("@src/lib/functions/hookLabels.js");

    addLabelForGuid("guid-123", { label: "count", index: 0, value: 42 });
    addLabelForGuid("guid-123", { label: "title", index: 1, value: "Hello" });

    const result = buildLabelsOnlyMountStateChanges("guid-123");

    expect(result).toHaveLength(2);

    expect(result[0]).toMatchObject({
      name: "count",
      value: 42,
      prevValue: undefined,
      hook: null,
      isIdenticalValueChange: false,
    });

    expect(result[1]).toMatchObject({
      name: "title",
      value: "Hello",
      prevValue: undefined,
      hook: null,
      isIdenticalValueChange: false,
    });
  });

  it("handles object values", async () => {
    const { addLabelForGuid } = await import("@src/lib/functions/hookLabels.js");

    const user = { name: "Alice", age: 30 };
    addLabelForGuid("guid-456", { label: "user", index: 0, value: user });

    const result = buildLabelsOnlyMountStateChanges("guid-456");

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("user");
    expect(result[0]?.value).toBe(user); // Same reference
    expect(result[0]?.prevValue).toBeUndefined();
  });

  it("sets hook to null for all entries", async () => {
    const { addLabelForGuid } = await import("@src/lib/functions/hookLabels.js");

    addLabelForGuid("guid-789", { label: "state1", index: 0, value: 1 });
    addLabelForGuid("guid-789", { label: "state2", index: 1, value: 2 });

    const result = buildLabelsOnlyMountStateChanges("guid-789");

    expect(result.every((entry) => { return entry.hook === null; })).toBe(true);
  });

  it("sets isIdenticalValueChange to false on mount", async () => {
    const { addLabelForGuid } = await import("@src/lib/functions/hookLabels.js");

    addLabelForGuid("guid-abc", { label: "value", index: 0, value: { data: "test" } });

    const result = buildLabelsOnlyMountStateChanges("guid-abc");

    expect(result[0]?.isIdenticalValueChange).toBe(false);
  });

  it("handles different GUID separately", async () => {
    const { addLabelForGuid } = await import("@src/lib/functions/hookLabels.js");

    addLabelForGuid("guid-1", { label: "state", index: 0, value: "one" });
    addLabelForGuid("guid-2", { label: "state", index: 0, value: "two" });

    const result1 = buildLabelsOnlyMountStateChanges("guid-1");
    const result2 = buildLabelsOnlyMountStateChanges("guid-2");

    expect(result1[0]?.value).toBe("one");
    expect(result2[0]?.value).toBe("two");
  });
});
