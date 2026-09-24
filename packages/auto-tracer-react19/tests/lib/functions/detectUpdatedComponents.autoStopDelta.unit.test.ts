// TDD failing test: auto-stop must use renders-since-start (delta), not the monotonic total count.
// Without the fix, if more renders occurred before tracing started than the limit, auto-stop
// fires on the very first detectUpdatedComponents call instead of after `limit` new renders.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  detectUpdatedComponents,
  setAutoStopCallback,
  updateCachedAutoStopLimit,
} from "@src/lib/functions/detectUpdatedComponents";

vi.mock(
  "@src/lib/functions/treeProcessing/building/buildTreeFromFiber.js",
  () => {
    return {
      buildTreeFromFiber: vi.fn(() => {
        return [];
      }),
    };
  },
);

vi.mock(
  "@src/lib/functions/treeProcessing/filtering/applyEmptyNodeFilter.js",
  () => {
    return {
      applyEmptyNodeFilter: vi.fn(() => {
        return vi.fn((nodes: unknown[]) => {
          return nodes;
        });
      }),
    };
  },
);

vi.mock("@src/lib/functions/treeProcessing/rendering/renderTree.js", () => {
  return { renderTree: vi.fn() };
});

vi.mock("@src/lib/functions/renderRegistry.js", () => {
  return { clearRenderRegistry: vi.fn() };
});

vi.mock("@logger/internalLogger.js", () => {
  return {
    internalLogger: {
      enter: vi.fn(() => {
        return Symbol("handle");
      }),
      exit: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      log: vi.fn(),
      info: vi.fn(),
    },
  };
});

vi.mock("@src/lib/functions/log.js", () => {
  return { logError: vi.fn(), logGroup: vi.fn(), logGroupEnd: vi.fn() };
});

vi.mock("@src/lib/functions/functionCache/clearFunctionCache.js", () => {
  return { clearFunctionCache: vi.fn() };
});

describe("detectUpdatedComponents - auto-stop uses delta since start", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Enable tracer for these tests
    const { getOrCreateSharedControl } =
      await import("@src/lib/functions/getOrCreateSharedControl.js");
    getOrCreateSharedControl().isIntendedToBeEnabled = true;
  });

  afterEach(() => {
    updateCachedAutoStopLimit(null);
    setAutoStopCallback(null);
  });

  it("does not auto-stop immediately when the absolute render count already exceeds the limit", async () => {
    const {
      resetRenderCycleCounter,
      incrementRenderCycle,
      snapshotRenderCycleStart,
    } = await import("@src/lib/types/globalState.js");
    const { getOrCreateSharedControl } = await import("@src/lib/functions/getOrCreateSharedControl.js");

    resetRenderCycleCounter();

    // Simulate renders that occurred before tracing started
    incrementRenderCycle(); // total = 1
    incrementRenderCycle(); // total = 2
    incrementRenderCycle(); // total = 3
    incrementRenderCycle(); // total = 4
    incrementRenderCycle(); // total = 5

    // Mark the start of tracing — auto-stop must count from here
    snapshotRenderCycleStart(); // snapshot = 5

    const autoStopSpy = vi.fn();
    setAutoStopCallback(autoStopSpy);
    updateCachedAutoStopLimit(3); // stop after 3 renders since start

    // Enable tracer AFTER all setup
    getOrCreateSharedControl().isIntendedToBeEnabled = true;

    const root = { current: {} };

    detectUpdatedComponents(root); // total = 6, delta = 1
    detectUpdatedComponents(root); // total = 7, delta = 2

    // Limit not yet reached — callback must NOT have fired
    expect(autoStopSpy).not.toHaveBeenCalled();

    detectUpdatedComponents(root); // total = 8, delta = 3 — triggers auto-stop

    expect(autoStopSpy).toHaveBeenCalledTimes(1);
  });

  it("auto-stops immediately on first call when limit is 1 and snapshot is current", async () => {
    const { resetRenderCycleCounter, snapshotRenderCycleStart } =
      await import("@src/lib/types/globalState.js");
    const { getOrCreateSharedControl } = await import("@src/lib/functions/getOrCreateSharedControl.js");

    resetRenderCycleCounter();
    snapshotRenderCycleStart(); // snapshot = 0

    const autoStopSpy = vi.fn();
    setAutoStopCallback(autoStopSpy);
    updateCachedAutoStopLimit(1); // stop after 1 render since start

    // Enable tracer AFTER all setup
    getOrCreateSharedControl().isIntendedToBeEnabled = true;

    const root = { current: {} };

    detectUpdatedComponents(root); // total = 1, delta = 1 => triggers auto-stop

    expect(autoStopSpy).toHaveBeenCalledTimes(1);
  });

  it("re-snapshotting resets the delta so the full limit is available again", async () => {
    const { resetRenderCycleCounter, snapshotRenderCycleStart } =
      await import("@src/lib/types/globalState.js");
    const { getOrCreateSharedControl } = await import("@src/lib/functions/getOrCreateSharedControl.js");

    resetRenderCycleCounter();
    snapshotRenderCycleStart(); // snapshot = 0

    const autoStopSpy = vi.fn();
    setAutoStopCallback(autoStopSpy);
    updateCachedAutoStopLimit(2);

    // Enable tracer AFTER all setup
    getOrCreateSharedControl().isIntendedToBeEnabled = true;

    const root = { current: {} };

    detectUpdatedComponents(root); // delta = 1
    detectUpdatedComponents(root); // delta = 2 => auto-stop fires

    expect(autoStopSpy).toHaveBeenCalledTimes(1);

    // Simulate restart: re-snapshot
    snapshotRenderCycleStart(); // snapshot = 2 (after 2 renders above)

    autoStopSpy.mockClear();

    detectUpdatedComponents(root); // delta = 1 from new snapshot
    expect(autoStopSpy).not.toHaveBeenCalled();

    detectUpdatedComponents(root); // delta = 2 => auto-stop fires again

    expect(autoStopSpy).toHaveBeenCalledTimes(1);
  });
});
