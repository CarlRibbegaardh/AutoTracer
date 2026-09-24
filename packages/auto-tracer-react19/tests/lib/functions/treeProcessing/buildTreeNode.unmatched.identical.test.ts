import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildTreeNode } from "@src/lib/functions/treeProcessing/building/buildTreeNode";
import type { Hook } from "@src/lib/functions/hookMapping/types";
import {
  addLabelForGuid,
  clearAllHookLabels,
  clearLabelsForGuid,
  savePrevLabelsForGuid,
} from "@src/lib/functions/hookLabels";
import { registerTrackedGUID } from "@src/lib/functions/renderRegistry";
import { traceOptions } from "@src/lib/types/globalState";
import { getPrevLabelsForGuid } from "@src/lib/functions/hookLabels";

function createTrackingRefHook(guid: string): Hook {
  return {
    memoizedState: { current: guid },
    baseState: { current: guid },
    baseQueue: null,
    queue: null,
    next: null,
  } as unknown as Hook;
}

function chainHooks(hooks: Hook[]): Hook | null {
  if (hooks.length === 0) return null;
  for (let i = 0; i < hooks.length - 1; i++) hooks[i]!.next = hooks[i + 1]!;
  return hooks[0]!;
}

function createFiber(guid: string, withAlternate = true) {
  const memoizedState = chainHooks([createTrackingRefHook(guid)]);
  const alt = withAlternate
    ? {
        elementType: { name: "X" },
        type: { name: "X" },
        memoizedState,
      }
    : null;

  return {
    elementType: { name: "Comp" },
    type: { name: "Comp" },
    alternate: alt,
    flags: 1,
    memoizedProps: {},
    pendingProps: {},
    memoizedState,
    _debugHookTypes: ["useRef"],
    child: null,
    sibling: null,
  };
}

describe("buildTreeNode - unmatched labeled values identical detection", () => {
  const guid = "render-track-unmatched-identical";

  beforeEach(() => {
    clearAllHookLabels();
    // Enable identical detection for this test
    traceOptions.detectIdenticalValueChanges = true;
  });

  afterEach(() => {
    clearAllHookLabels();
  });

  it("marks same wrapper object with same functions as identical change (warning case)", () => {
    // Create stable function references
    const exitFn = () => {};
    const logFn = () => {};
    const stateFn = () => {};

    // Previous render - same wrapper created each render but contains same functions
    addLabelForGuid(guid, {
      index: 0,
      label: "messages",
      value: {
        exit: exitFn,
        log: logFn,
        state: stateFn,
      },
    });
    savePrevLabelsForGuid(guid);
    expect(getPrevLabelsForGuid(guid).length).toBe(1);

    // New render - new wrapper object but same function instances
    clearLabelsForGuid(guid);
    addLabelForGuid(guid, {
      index: 0,
      label: "messages",
      value: {
        exit: exitFn,
        log: logFn,
        state: stateFn,
      },
    });

    const fiber = createFiber(guid, true);
    registerTrackedGUID(guid);
    const node = buildTreeNode(fiber, 0);

    const change = node.stateChanges.find((c) => {return c.name === "messages"});
    expect(change).toBeDefined();
    // Should warn: wrapper object is unstable but content is identical
    expect(change!.isIdenticalValueChange).toBe(true);
  });

  it("marks different wrapper with different functions as real change (no warning)", () => {
    // Previous render - specific function instances
    addLabelForGuid(guid, {
      index: 0,
      label: "messages",
      value: {
        exit: () => {},
        log: () => {},
        state: () => {},
      },
    });
    savePrevLabelsForGuid(guid);
    expect(getPrevLabelsForGuid(guid).length).toBe(1);

    // New render - different function instances (different IDs)
    clearLabelsForGuid(guid);
    addLabelForGuid(guid, {
      index: 0,
      label: "messages",
      value: {
        exit: () => {},
        log: () => {},
        state: () => {},
      },
    });

    const fiber = createFiber(guid, true);
    registerTrackedGUID(guid);
    const node = buildTreeNode(fiber, 0);

    const change = node.stateChanges.find((c) => {return c.name === "messages"});
    expect(change).toBeDefined();
    // Should NOT warn: functions are actually different
    expect(change!.isIdenticalValueChange).toBe(false);
  });
});
