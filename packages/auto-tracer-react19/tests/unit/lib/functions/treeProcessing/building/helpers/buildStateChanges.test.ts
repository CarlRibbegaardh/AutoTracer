import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Hook } from "@src/lib/functions/hookMapping/types";
import type { AnchorEntry } from "@src/lib/functions/treeProcessing/building/helpers/getHookAnchors";
import type { StateChangeEntry, UseStateValueEntry } from "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges";

describe("buildStateChanges", () => {
  beforeEach(async () => {
    // Clear modules to reset state between tests
    vi.resetModules();
  });

  describe("mount path (isNewMount=true)", () => {
    it("filters out React internal state and marker values", async () => {
      const { buildStateChanges } = await import(
        "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges.js"
      );
      const { REACTTRACER_STATE_MARKER } = await import("@src/lib/types/marker.js");

      const hook1: Hook = { memoizedState: "value1", baseQueue: null, queue: null, next: null };
      const hook2: Hook = { memoizedState: "value2", baseQueue: null, queue: null, next: null };

      const useStateValues: UseStateValueEntry[] = [
        { name: "state0", value: "normalValue", hook: hook1 as never },
        { name: "__reactInternal$", value: "internal", hook: null },
        { name: "state1", value: REACTTRACER_STATE_MARKER, hook: hook2 as never },
      ];

      const anchors: Hook[] = [hook1, hook2];
      const allAnchors: AnchorEntry[] = [
        { index: 0, value: "value1" },
        { index: 1, value: "value2" },
      ];

      const result = buildStateChanges(
        true,
        useStateValues,
        anchors,
        allAnchors,
        null
      );

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBeDefined();
      expect(result[0]?.value).toBe("normalValue");
      expect(result[0]?.prevValue).toBeUndefined();
      expect(result[0]?.isIdenticalValueChange).toBe(false);
    });

    it("resolves hook labels for mount", async () => {
      const { buildStateChanges } = await import(
        "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges.js"
      );

      const hook1: Hook = { memoizedState: "testValue", baseQueue: null, queue: null, next: null };
      const useStateValues: UseStateValueEntry[] = [
        { name: "state0", value: "testValue", hook: hook1 as never },
      ];
      const anchors: Hook[] = [hook1];
      const allAnchors: AnchorEntry[] = [{ index: 0, value: "testValue" }];

      const result = buildStateChanges(
        true,
        useStateValues,
        anchors,
        allAnchors,
        "test-guid"
      );

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBeDefined();
      expect(result[0]?.value).toBe("testValue");
    });

    it("handles null hooks gracefully", async () => {
      const { buildStateChanges } = await import(
        "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges.js"
      );

      const useStateValues: UseStateValueEntry[] = [
        { name: "state0", value: "testValue", hook: null },
      ];

      const result = buildStateChanges(true, useStateValues, [], [], null);

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toMatch(/state-?\d+/);
      expect(result[0]?.value).toBe("testValue");
      expect(result[0]?.hook).toBeNull();
    });

    it("handles hooks without memoizedState property", async () => {
      const { buildStateChanges } = await import(
        "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges.js"
      );

      const invalidHook = { queue: null, next: null } as never;
      const useStateValues: UseStateValueEntry[] = [
        { name: "state0", value: "testValue", hook: invalidHook },
      ];
      const anchors: Hook[] = [];

      const result = buildStateChanges(true, useStateValues, anchors, [], null);

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toMatch(/state-?\d+/);
      expect(result[0]?.value).toBe("testValue");
    });

    it("includes unmatched labeled state for tracked components", async () => {
      const { buildStateChanges } = await import(
        "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges.js"
      );
      const { addLabelForGuid } = await import("@src/lib/functions/hookLabels.js");

      const trackingGUID = "mount-guid-1";

      // Label some state
      addLabelForGuid(trackingGUID, { label: "labeledValue", index: 0, value: "valueFromLabel" });

      const hook1: Hook = { memoizedState: "fiberValue", baseQueue: null, queue: null, next: null };
      const useStateValues: UseStateValueEntry[] = [
        { name: "differentName", value: "fiberValue", hook: hook1 as never },
      ];
      const anchors: Hook[] = [hook1];
      const allAnchors: AnchorEntry[] = [{ index: 0, value: "fiberValue" }];

      const result = buildStateChanges(
        true,
        useStateValues,
        anchors,
        allAnchors,
        trackingGUID
      );

      // Should have fiber state + unmatched label
      expect(result.length).toBeGreaterThanOrEqual(1);
      const labeledEntry = result.find((e) => {return e.name === "labeledValue"});
      expect(labeledEntry).toBeDefined();
      expect(labeledEntry?.value).toBe("valueFromLabel");
      expect(labeledEntry?.hook).toBeNull();
    });

    it("does not include unmatched labels for untracked components", async () => {
      const { buildStateChanges } = await import(
        "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges.js"
      );

      const useStateValues: UseStateValueEntry[] = [];

      const result = buildStateChanges(true, useStateValues, [], [], null);

      expect(result).toHaveLength(0);
    });
  });

  describe("update path (isNewMount=false)", () => {
    it("filters out unchanged values", async () => {
      const { buildStateChanges } = await import(
        "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges.js"
      );

      const hook1: Hook = { memoizedState: "value1", baseQueue: null, queue: null, next: null };
      const hook2: Hook = { memoizedState: "newValue", baseQueue: null, queue: null, next: null };

      const useStateValues: UseStateValueEntry[] = [
        {
          name: "state0",
          value: "value1",
          prevValue: "value1",
          hook: hook1 as never,
        },
        {
          name: "state1",
          value: "newValue",
          prevValue: "oldValue",
          hook: hook2 as never,
        },
      ];

      const anchors: Hook[] = [hook1, hook2];
      const allAnchors: AnchorEntry[] = [
        { index: 0, value: "value1" },
        { index: 1, value: "newValue" },
      ];

      const result = buildStateChanges(
        false,
        useStateValues,
        anchors,
        allAnchors,
        null
      );

      expect(result).toHaveLength(1);
      expect(result[0]?.value).toBe("newValue");
      expect(result[0]?.prevValue).toBe("oldValue");
    });

    it("filters out values without prevValue", async () => {
      const { buildStateChanges } = await import(
        "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges.js"
      );

      const hook1: Hook = { memoizedState: "value1", baseQueue: null, queue: null, next: null };

      const useStateValues: UseStateValueEntry[] = [
        { name: "state0", value: "value1", hook: hook1 as never },
      ];

      const anchors: Hook[] = [hook1];
      const allAnchors: AnchorEntry[] = [{ index: 0, value: "value1" }];

      const result = buildStateChanges(
        false,
        useStateValues,
        anchors,
        allAnchors,
        null
      );

      expect(result).toHaveLength(0);
    });

    it("filters out React internal and marker values", async () => {
      const { buildStateChanges } = await import(
        "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges.js"
      );
      const { REACTTRACER_STATE_MARKER } = await import("@src/lib/types/marker.js");

      const useStateValues: UseStateValueEntry[] = [
        {
          name: "__reactInternal$",
          value: "new",
          prevValue: "old",
          hook: null,
        },
        {
          name: "state0",
          value: REACTTRACER_STATE_MARKER,
          prevValue: "old",
          hook: null,
        },
        {
          name: "state1",
          value: "new",
          prevValue: REACTTRACER_STATE_MARKER,
          hook: null,
        },
      ];

      const result = buildStateChanges(false, useStateValues, [], [], null);

      expect(result).toHaveLength(0);
    });

    it("detects identical value changes when enabled", async () => {
      const { buildStateChanges } = await import(
        "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges.js"
      );
      const { traceOptions } = await import("@src/lib/types/globalState.js");

      traceOptions.detectIdenticalValueChanges = true;

      const hook1: Hook = { memoizedState: { a: 1 }, baseQueue: null, queue: null, next: null };

      const useStateValues: UseStateValueEntry[] = [
        {
          name: "state0",
          value: { a: 1 },
          prevValue: { a: 1 },
          hook: hook1 as never,
        },
      ];

      const anchors: Hook[] = [hook1];
      const allAnchors: AnchorEntry[] = [{ index: 0, value: { a: 1 } }];

      const result = buildStateChanges(
        false,
        useStateValues,
        anchors,
        allAnchors,
        null
      );

      expect(result).toHaveLength(1);
      expect(result[0]?.isIdenticalValueChange).toBe(true);
    });

    it("does not detect identical values when disabled", async () => {
      const { buildStateChanges } = await import(
        "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges.js"
      );
      const { traceOptions } = await import("@src/lib/types/globalState.js");

      traceOptions.detectIdenticalValueChanges = false;

      const hook1: Hook = { memoizedState: { a: 1 }, baseQueue: null, queue: null, next: null };

      const useStateValues: UseStateValueEntry[] = [
        {
          name: "state0",
          value: { a: 1 },
          prevValue: { a: 1 },
          hook: hook1 as never,
        },
      ];

      const anchors: Hook[] = [hook1];
      const allAnchors: AnchorEntry[] = [{ index: 0, value: { a: 1 } }];

      const result = buildStateChanges(
        false,
        useStateValues,
        anchors,
        allAnchors,
        null
      );

      expect(result).toHaveLength(1);
      expect(result[0]?.isIdenticalValueChange).toBe(false);
    });

    it("uses cached resolveHookLabel for updates", async () => {
      const { buildStateChanges } = await import(
        "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges.js"
      );

      const hook1: Hook = { memoizedState: "value1", baseQueue: null, queue: null, next: null };

      const useStateValues: UseStateValueEntry[] = [
        {
          name: "state0",
          value: "newValue",
          prevValue: "oldValue",
          hook: hook1 as never,
        },
      ];

      const anchors: Hook[] = [hook1];
      const allAnchors: AnchorEntry[] = [{ index: 0, value: "value1" }];

      // First call
      const result1 = buildStateChanges(
        false,
        useStateValues,
        anchors,
        allAnchors,
        "guid-1"
      );

      // Second call with same parameters should use cache
      const result2 = buildStateChanges(
        false,
        useStateValues,
        anchors,
        allAnchors,
        "guid-1"
      );

      expect(result1).toHaveLength(1);
      expect(result2).toHaveLength(1);
      expect(result1[0]?.name).toBe(result2[0]?.name);
    });

    it("includes unmatched labeled state changes for tracked components", async () => {
      const { buildStateChanges } = await import(
        "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges.js"
      );
      const { addLabelForGuid, clearLabelsForGuid } = await import("@src/lib/functions/hookLabels.js");

      const trackingGUID = "update-guid-1";

      // Simulate prev labels
      addLabelForGuid(trackingGUID, { label: "labeledValue", index: 0, value: "oldLabelValue" });

      // Build once to establish prev state
      buildStateChanges(false, [], [], [], trackingGUID);

      // Clear and update label (simulating new render)
      clearLabelsForGuid(trackingGUID);
      addLabelForGuid(trackingGUID, { label: "labeledValue", index: 0, value: "newLabelValue" });

      const result = buildStateChanges(false, [], [], [], trackingGUID);

      const labeledEntry = result.find((e) => {return e.name === "labeledValue"});
      expect(labeledEntry).toBeDefined();
      expect(labeledEntry?.value).toBe("newLabelValue");
      expect(labeledEntry?.prevValue).toBe("oldLabelValue");
    });

    it("persists prev labels after update computation (side effect)", async () => {
      const { buildStateChanges } = await import(
        "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges.js"
      );
      const { addLabelForGuid, getPrevLabelsForGuid, clearLabelsForGuid } = await import(
        "@src/lib/functions/hookLabels.js"
      );

      const trackingGUID = "side-effect-guid";

      addLabelForGuid(trackingGUID, { label: "value1", index: 0, value: "initial" });

      // First update
      buildStateChanges(false, [], [], [], trackingGUID);

      // Clear and update label (simulating new render)
      clearLabelsForGuid(trackingGUID);
      addLabelForGuid(trackingGUID, { label: "value1", index: 0, value: "updated" });

      // Second update should save prev labels
      buildStateChanges(false, [], [], [], trackingGUID);

      const prevLabels = getPrevLabelsForGuid(trackingGUID);
      expect(prevLabels).toHaveLength(1);
      expect(prevLabels[0]?.label).toBe("value1");
      expect(prevLabels[0]?.value).toBe("updated");
    });

    it("excludes unmatched labels with same value", async () => {
      const { buildStateChanges } = await import(
        "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges.js"
      );
      const { addLabelForGuid } = await import("@src/lib/functions/hookLabels.js");

      const trackingGUID = "unchanged-guid";

      addLabelForGuid(trackingGUID, { label: "unchangedValue", index: 0, value: "sameValue" });
      buildStateChanges(false, [], [], [], trackingGUID);

      addLabelForGuid(trackingGUID, { label: "unchangedValue", index: 0, value: "sameValue" });
      const result = buildStateChanges(false, [], [], [], trackingGUID);

      const unchangedEntry = result.find((e) => {return e.name === "unchangedValue"});
      expect(unchangedEntry).toBeUndefined();
    });

    it("excludes unmatched labels without previous value", async () => {
      const { buildStateChanges } = await import(
        "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges.js"
      );
      const { addLabelForGuid } = await import("@src/lib/functions/hookLabels.js");

      const trackingGUID = "new-label-guid";

      // Build once with no labels
      buildStateChanges(false, [], [], [], trackingGUID);

      // Add new label
      addLabelForGuid(trackingGUID, { label: "newLabel", index: 0, value: "newValue" });

      const result = buildStateChanges(false, [], [], [], trackingGUID);

      // New label without prev value should be excluded
      const newEntry = result.find((e) => {return e.name === "newLabel"});
      expect(newEntry).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("handles empty useStateValues array", async () => {
      const { buildStateChanges } = await import(
        "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges.js"
      );

      const result = buildStateChanges(true, [], [], [], null);

      expect(result).toHaveLength(0);
    });

    it("handles mixed fiber and label changes", async () => {
      const { buildStateChanges } = await import(
        "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges.js"
      );
      const { addLabelForGuid } = await import("@src/lib/functions/hookLabels.js");

      const trackingGUID = "mixed-guid";
      const hook1: Hook = { memoizedState: "fiberValue", baseQueue: null, queue: null, next: null };

      addLabelForGuid(trackingGUID, { label: "labeledValue", index: 0, value: "oldLabel" });
      buildStateChanges(false, [], [], [], trackingGUID);

      addLabelForGuid(trackingGUID, { label: "labeledValue", index: 0, value: "newLabel" });

      const useStateValues: UseStateValueEntry[] = [
        {
          name: "fiberState",
          value: "newFiber",
          prevValue: "oldFiber",
          hook: hook1 as never,
        },
      ];

      const anchors: Hook[] = [hook1];
      const allAnchors: AnchorEntry[] = [{ index: 0, value: "fiberValue" }];

      const result = buildStateChanges(
        false,
        useStateValues,
        anchors,
        allAnchors,
        trackingGUID
      );

      expect(result.length).toBeGreaterThanOrEqual(2);
      const fiberEntry = result.find((e) => {return e.hook !== null});
      const labelEntry = result.find((e) => {return e.hook === null});
      expect(fiberEntry).toBeDefined();
      expect(labelEntry).toBeDefined();
    });
  });
});
