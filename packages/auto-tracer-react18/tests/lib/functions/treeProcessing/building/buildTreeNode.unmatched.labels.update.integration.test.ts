import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildTreeNode } from "@src/lib/functions/treeProcessing/building/buildTreeNode";
import { addLabelForGuid, clearAllHookLabels } from "@src/lib/functions/hookLabels";
import { clearRenderRegistry, registerTrackedGUID } from "@src/lib/functions/renderRegistry";
import { traceOptions } from "@src/lib/types/globalState";
import type { Hook } from "@src/lib/functions/hookMapping/types";
import type { FiberNode } from "@src/lib/interfaces/FiberNode";

function createTrackingRefHook(guid: string): Hook {
  return {
    memoizedState: { current: guid },
    baseState: { current: guid },
    baseQueue: null,
    queue: null,
    next: null,
  };
}

function chainHooks(hooks: Hook[]): Hook | null {
  if (hooks.length === 0) return null;
  for (let i = 0; i < hooks.length - 1; i++) hooks[i]!.next = hooks[i + 1]!;
  return hooks[0]!;
}

function createFiberWithTrackingOnly(componentName: string, guid: string, alternate?: FiberNode | null) {
  const memoizedState = chainHooks([createTrackingRefHook(guid)]);
  return {
    elementType: { name: componentName },
    type: { name: componentName },
    alternate,
    flags: 1,
    memoizedProps: {},
    pendingProps: {},
    memoizedState,
    _debugHookTypes: ["useRef"],
  } as const;
}

describe("buildTreeNode - unmatched labeled values on update", () => {
  const guid = "render-track-unmatched-guid";
  beforeEach(() => {
    registerTrackedGUID(guid);
  });
  afterEach(() => {
    clearAllHookLabels();
    clearRenderRegistry();
  });

  it("emits unmatched labeled change on second update using prev snapshot", () => {
    // First update: label exists (no state hooks), buildTreeNode should snapshot prev labels
    addLabelForGuid(guid, { label: "externalFn", index: 0, value: function v1() {} });
    const prev = createFiberWithTrackingOnly("C", guid);
    const fiber1 = createFiberWithTrackingOnly("C", guid, prev);
    const n1 = buildTreeNode(fiber1, 0);
    // No state hooks -> no matched labels; no unmatched change yet because there is no prev value
    expect(n1.stateChanges.length === 0 || n1.stateChanges.every((c) => {return c.name !== "externalFn"})).toBe(true);

    // Second update: change label reference
    clearAllHookLabels();
    addLabelForGuid(guid, { label: "externalFn", index: 0, value: function v2() {} });
    const fiber2 = createFiberWithTrackingOnly("C", guid, prev);
    const n2 = buildTreeNode(fiber2, 0);

    const change = n2.stateChanges.find((c) => {return c.name === "externalFn"});
    expect(change).toBeTruthy();
    expect(change?.prevValue).not.toBe(change?.value);
  });

  it("emits the first labeled update after mount in labels-only mode", () => {
    const previousTrackedStateResolution = traceOptions.trackedStateResolution;
    traceOptions.trackedStateResolution = "labels-only";

    try {
      addLabelForGuid(guid, { label: "count", index: 0, value: 1 });

      const mountedFiber = createFiberWithTrackingOnly("C", guid);
      const mountNode = buildTreeNode(mountedFiber, 0);

      const mountChange = mountNode.stateChanges.find((c) => {return c.name === "count"});
      expect(mountChange?.value).toBe(1);

      clearAllHookLabels();
      addLabelForGuid(guid, { label: "count", index: 0, value: 2 });

      const updateFiber = createFiberWithTrackingOnly("C", guid, mountedFiber);
      const updateNode = buildTreeNode(updateFiber, 0);

      const updateChange = updateNode.stateChanges.find((c) => {return c.name === "count"});
      expect(updateChange).toBeTruthy();
      expect(updateChange?.prevValue).toBe(1);
      expect(updateChange?.value).toBe(2);
    } finally {
      traceOptions.trackedStateResolution = previousTrackedStateResolution;
    }
  });
});
