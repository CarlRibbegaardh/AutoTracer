import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  detectUpdatedComponents,
  setAutoStartCallback,
  updateCachedStartTrigger,
  updateCachedTriggerRearmMode,
} from "@src/lib/functions/detectUpdatedComponents";

// Mock dependencies
vi.mock("@src/lib/functions/treeProcessing/building/buildTreeFromFiber.js", () => {
  return {
    buildTreeFromFiber: vi.fn(() => {return []}),
  };
});

vi.mock("@src/lib/functions/treeProcessing/filtering/applyEmptyNodeFilter.js", () => {
  return {
    applyEmptyNodeFilter: vi.fn(() => {return vi.fn((nodes) => {return nodes})}),
  };
});

vi.mock("@src/lib/functions/treeProcessing/rendering/renderTree.js", () => {
  return {
    renderTree: vi.fn(),
  };
});

vi.mock("@src/lib/functions/renderRegistry.js", () => {
  return {
    clearRenderRegistry: vi.fn(),
  };
});

vi.mock("@logger/internalLogger.js", () => {
  return {
    internalLogger: {
      enter: vi.fn(() => {return Symbol("handle")}),
      exit: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      log: vi.fn(),
      info: vi.fn(),
    },
  };
});

vi.mock("@src/lib/functions/log.js", () => {
  return {
    logError: vi.fn(),
    logGroup: vi.fn(),
    logGroupEnd: vi.fn(),
  };
});

describe("detectUpdatedComponents", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Enable tracer for these tests
    const { getOrCreateSharedControl } = await import("@src/lib/functions/getOrCreateSharedControl.js");
    getOrCreateSharedControl().isIntendedToBeEnabled = true;
  });

  it("should return early when root is falsy", async () => {
    const { buildTreeFromFiber } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/building/buildTreeFromFiber.js")
    );
    const { applyEmptyNodeFilter } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/filtering/applyEmptyNodeFilter.js")
    );
    const { renderTree } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/rendering/renderTree.js")
    );
    const { clearRenderRegistry } = vi.mocked(
      await import("@src/lib/functions/renderRegistry.js")
    );
    const { logGroup, logGroupEnd } = vi.mocked(
      await import("@src/lib/functions/log.js")
    );

    detectUpdatedComponents(null);

    expect(logGroup).not.toHaveBeenCalled();
    expect(buildTreeFromFiber).not.toHaveBeenCalled();
    expect(applyEmptyNodeFilter).not.toHaveBeenCalled();
    expect(renderTree).not.toHaveBeenCalled();
    expect(clearRenderRegistry).not.toHaveBeenCalled();
    expect(logGroupEnd).not.toHaveBeenCalled();
  });

  it("should return early when root.current is falsy", async () => {
    const { buildTreeFromFiber } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/building/buildTreeFromFiber.js")
    );
    const { applyEmptyNodeFilter } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/filtering/applyEmptyNodeFilter.js")
    );
    const { renderTree } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/rendering/renderTree.js")
    );
    const { clearRenderRegistry } = vi.mocked(
      await import("@src/lib/functions/renderRegistry.js")
    );
    const { logGroup, logGroupEnd } = vi.mocked(
      await import("@src/lib/functions/log.js")
    );

    const root = { current: null };
    detectUpdatedComponents(root);

    expect(logGroup).not.toHaveBeenCalled();
    expect(buildTreeFromFiber).not.toHaveBeenCalled();
    expect(applyEmptyNodeFilter).not.toHaveBeenCalled();
    expect(renderTree).not.toHaveBeenCalled();
    expect(clearRenderRegistry).not.toHaveBeenCalled();
    expect(logGroupEnd).not.toHaveBeenCalled();
  });

  it("should return early when root.current is undefined", async () => {
    const { buildTreeFromFiber } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/building/buildTreeFromFiber.js")
    );
    const { applyEmptyNodeFilter } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/filtering/applyEmptyNodeFilter.js")
    );
    const { renderTree } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/rendering/renderTree.js")
    );
    const { clearRenderRegistry } = vi.mocked(
      await import("@src/lib/functions/renderRegistry.js")
    );
    const { logGroup, logGroupEnd } = vi.mocked(
      await import("@src/lib/functions/log.js")
    );

    const root = {};
    detectUpdatedComponents(root);

    expect(logGroup).not.toHaveBeenCalled();
    expect(buildTreeFromFiber).not.toHaveBeenCalled();
    expect(applyEmptyNodeFilter).not.toHaveBeenCalled();
    expect(renderTree).not.toHaveBeenCalled();
    expect(clearRenderRegistry).not.toHaveBeenCalled();
    expect(logGroupEnd).not.toHaveBeenCalled();
  });

  it("should process valid root and call all required functions", async () => {
    const { buildTreeFromFiber } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/building/buildTreeFromFiber.js")
    );
    const { applyEmptyNodeFilter } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/filtering/applyEmptyNodeFilter.js")
    );
    const { renderTree } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/rendering/renderTree.js")
    );
    const { clearRenderRegistry } = vi.mocked(
      await import("@src/lib/functions/renderRegistry.js")
    );
    const { logGroup, logGroupEnd } = vi.mocked(
      await import("@src/lib/functions/log.js")
    );

    const mockFiberNode = { type: "div", props: {} };
    const root = { current: mockFiberNode };

    // Mock buildTreeFromFiber to return nodes so the group is opened
    const mockTreeNode = {
      componentName: "TestComponent",
      displayName: "TestComponent",
      depth: 0,
      renderType: "Rendering" as const,
      flags: 0,
      stateChanges: [],
      propChanges: [],
      componentLogs: [],
      isTracked: false,
      trackingGUID: null,
      hasIdenticalValueWarning: false,
    };
    buildTreeFromFiber.mockReturnValue([mockTreeNode]);

    // Mock the filter function to return the nodes
    const mockFilterFn = vi.fn((nodes) => {return nodes});
    applyEmptyNodeFilter.mockReturnValue(mockFilterFn);

    // Reset counter for predictable output
    const { resetRenderCycleCounter } = await import("@src/lib/types/globalState.js");
    const { getOrCreateSharedControl } = await import("@src/lib/functions/getOrCreateSharedControl.js");
    resetRenderCycleCounter();

    // Enable tracer AFTER resetRenderCycleCounter
    getOrCreateSharedControl().isIntendedToBeEnabled = true;

    detectUpdatedComponents(root);

    expect(logGroup).toHaveBeenCalledWith("Component render cycle 1:");
    expect(buildTreeFromFiber).toHaveBeenCalledWith(mockFiberNode, 0);
    expect(applyEmptyNodeFilter).toHaveBeenCalled();
    expect(renderTree).toHaveBeenCalled();
    expect(clearRenderRegistry).toHaveBeenCalled();
    expect(logGroupEnd).toHaveBeenCalled();
  });

  it("should call functions in correct order", async () => {
    const { buildTreeFromFiber } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/building/buildTreeFromFiber.js")
    );
    const { applyEmptyNodeFilter } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/filtering/applyEmptyNodeFilter.js")
    );
    const { renderTree } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/rendering/renderTree.js")
    );
    const { clearRenderRegistry } = vi.mocked(
      await import("@src/lib/functions/renderRegistry.js")
    );
    const { logGroup, logGroupEnd } = vi.mocked(
      await import("@src/lib/functions/log.js")
    );

    const callOrder: string[] = [];

    logGroup.mockImplementation(() => {
      callOrder.push("logGroup");
    });
    buildTreeFromFiber.mockImplementation(() => {
      callOrder.push("buildTreeFromFiber");
      // Return a mock node so the group is opened
      return [
        {
          componentName: "TestComponent",
          displayName: "TestComponent",
          depth: 0,
          renderType: "Rendering" as const,
          flags: 0,
          stateChanges: [],
          propChanges: [],
          componentLogs: [],
          isTracked: false,
          trackingGUID: null,
          hasIdenticalValueWarning: false,
        },
      ];
    });
    const mockFilterFn = vi.fn((nodes) => {
      callOrder.push("filterFn");
      return nodes;
    });
    applyEmptyNodeFilter.mockImplementation(() => {
      callOrder.push("applyEmptyNodeFilter");
      return mockFilterFn;
    });
    renderTree.mockImplementation(() => {
      callOrder.push("renderTree");
    });
    clearRenderRegistry.mockImplementation(() => {
      callOrder.push("clearRenderRegistry");
    });
    logGroupEnd.mockImplementation(() => {
      callOrder.push("logGroupEnd");
    });

    const { getOrCreateSharedControl } = await import("@src/lib/functions/getOrCreateSharedControl.js");
    getOrCreateSharedControl().isIntendedToBeEnabled = true;

    const root = { current: {} };
    detectUpdatedComponents(root);

    expect(callOrder).toEqual([
      "buildTreeFromFiber",
      "applyEmptyNodeFilter",
      "filterFn",
      "logGroup",
      "renderTree",
      "clearRenderRegistry",
      "logGroupEnd",
    ]);
  });

  it("should handle errors gracefully and clean up state", async () => {
    const { buildTreeFromFiber } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/building/buildTreeFromFiber.js")
    );
    const { applyEmptyNodeFilter } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/filtering/applyEmptyNodeFilter.js")
    );
    const { renderTree } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/rendering/renderTree.js")
    );
    const { clearRenderRegistry } = vi.mocked(
      await import("@src/lib/functions/renderRegistry.js")
    );
    const { internalLogger } = vi.mocked(
      await import("@logger/internalLogger.js")
    );
    const { logGroup, logGroupEnd } = vi.mocked(
      await import("@src/lib/functions/log.js")
    );

    const testError = new Error("Test error");
    buildTreeFromFiber.mockImplementation(() => {
      throw testError;
    });

    const root = { current: {} };
    detectUpdatedComponents(root);

    // Group should NOT be opened since buildTreeFromFiber throws before we can check for nodes
    expect(logGroup).not.toHaveBeenCalled();
    expect(buildTreeFromFiber).toHaveBeenCalled();
    expect(logGroupEnd).toHaveBeenCalledTimes(1); // Once in catch
    expect(internalLogger.error).toHaveBeenCalledWith(
      "ReactTracer: Error during component detection:",
      testError
    );
    expect(clearRenderRegistry).toHaveBeenCalled();
  });

  it("should not create console group when no nodes to render", async () => {
    const { buildTreeFromFiber } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/building/buildTreeFromFiber.js")
    );
    const { applyEmptyNodeFilter } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/filtering/applyEmptyNodeFilter.js")
    );
    const { renderTree } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/rendering/renderTree.js")
    );
    const { clearRenderRegistry } = vi.mocked(
      await import("@src/lib/functions/renderRegistry.js")
    );
    const { logGroup, logGroupEnd } = vi.mocked(
      await import("@src/lib/functions/log.js")
    );

    const mockFiberNode = { type: "div", props: {} };
    const root = { current: mockFiberNode };

    // Build returns nodes but filter removes them all
    const mockTreeNode = {
      componentName: "TestComponent",
      displayName: "TestComponent",
      depth: 0,
      renderType: "Rendering" as const,
      flags: 0,
      stateChanges: [],
      propChanges: [],
      componentLogs: [],
      isTracked: false,
      trackingGUID: null,
      hasIdenticalValueWarning: false,
    };
    buildTreeFromFiber.mockReturnValue([mockTreeNode]);

    // Filter returns empty array (all nodes filtered out)
    const mockFilterFn = vi.fn(() => {return []});
    applyEmptyNodeFilter.mockReturnValue(mockFilterFn);

    const { getOrCreateSharedControl } = await import("@src/lib/functions/getOrCreateSharedControl.js");
    getOrCreateSharedControl().isIntendedToBeEnabled = true;

    detectUpdatedComponents(root);

    // Group should NOT be opened since filtered result is empty
    expect(logGroup).not.toHaveBeenCalled();
    expect(logGroupEnd).not.toHaveBeenCalled();
    expect(buildTreeFromFiber).toHaveBeenCalledWith(mockFiberNode, 0);
    expect(applyEmptyNodeFilter).toHaveBeenCalled();
    // renderTree should still be called with empty array
    expect(renderTree).toHaveBeenCalledWith([]);
    expect(clearRenderRegistry).toHaveBeenCalled();
  });

  it("should handle cleanup errors gracefully", async () => {
    const { buildTreeFromFiber } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/building/buildTreeFromFiber.js")
    );
    const { clearRenderRegistry } = vi.mocked(
      await import("@src/lib/functions/renderRegistry.js")
    );
    const { internalLogger } = vi.mocked(
      await import("@logger/internalLogger.js")
    );

    const buildError = new Error("Build error");
    const cleanupError = new Error("Cleanup error");

    buildTreeFromFiber.mockImplementation(() => {
      throw buildError;
    });

    // Make clearRenderRegistry throw during cleanup
    clearRenderRegistry.mockImplementation(() => {
      throw cleanupError;
    });

    const root = { current: {} };
    detectUpdatedComponents(root);

    expect(internalLogger.error).toHaveBeenNthCalledWith(
      1,
      "ReactTracer: Error during component detection:",
      buildError
    );
    expect(internalLogger.error).toHaveBeenNthCalledWith(
      2,
      "ReactTracer: Error during cleanup:",
      cleanupError
    );
  });

  it("should pass correct parameters to buildTreeFromFiber", async () => {
    const { buildTreeFromFiber } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/building/buildTreeFromFiber.js")
    );
    const { applyEmptyNodeFilter } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/filtering/applyEmptyNodeFilter.js")
    );
    const { renderTree } = vi.mocked(
      await import("@src/lib/functions/treeProcessing/rendering/renderTree.js")
    );
    const { clearRenderRegistry } = vi.mocked(
      await import("@src/lib/functions/renderRegistry.js")
    );
    const { logGroup, logGroupEnd } = vi.mocked(
      await import("@src/lib/functions/log.js")
    );

    // Ensure all functions work normally for this test
    buildTreeFromFiber.mockImplementation(() => {return []});
    applyEmptyNodeFilter.mockImplementation(() => {return vi.fn((nodes) => {return nodes})});
    renderTree.mockImplementation(() => {});
    clearRenderRegistry.mockImplementation(() => {});
    logGroup.mockImplementation(() => {});
    logGroupEnd.mockImplementation(() => {});

    const mockFiberNode = {
      type: "div",
      props: { id: "test" },
      children: []
    };
    const root = { current: mockFiberNode };

    detectUpdatedComponents(root);

    expect(buildTreeFromFiber).toHaveBeenCalledWith(mockFiberNode, 0);
    expect(buildTreeFromFiber).toHaveBeenCalledTimes(1);
  });

  describe("render cycle counter", () => {
    it("should display 'Component render cycle 1:' on first render", async () => {
      const { buildTreeFromFiber } = vi.mocked(
        await import("@src/lib/functions/treeProcessing/building/buildTreeFromFiber.js")
      );
      const { applyEmptyNodeFilter } = vi.mocked(
        await import("@src/lib/functions/treeProcessing/filtering/applyEmptyNodeFilter.js")
      );
      const { logGroup } = vi.mocked(
        await import("@src/lib/functions/log.js")
      );

      // Mock to return nodes so the group is opened
      const mockTreeNode = {
        componentName: "TestComponent",
        displayName: "TestComponent",
        depth: 0,
        renderType: "Rendering" as const,
        flags: 0,
        stateChanges: [],
        propChanges: [],
        componentLogs: [],
        isTracked: false,
        trackingGUID: null,
        hasIdenticalValueWarning: false,
      };
      buildTreeFromFiber.mockReturnValue([mockTreeNode]);
      applyEmptyNodeFilter.mockReturnValue(vi.fn((nodes) => {return nodes}));

      const root = { current: {} };

      // Clear any previous state
      const { resetRenderCycleCounter } = await import("@src/lib/types/globalState.js");
      const { getOrCreateSharedControl } = await import("@src/lib/functions/getOrCreateSharedControl.js");
      resetRenderCycleCounter();

      // Enable tracer AFTER resetRenderCycleCounter
      getOrCreateSharedControl().isIntendedToBeEnabled = true;

      detectUpdatedComponents(root);

      expect(logGroup).toHaveBeenCalledWith("Component render cycle 1:");
    });

    it("should increment counter on subsequent renders with nodes", async () => {
      const { buildTreeFromFiber } = vi.mocked(
        await import("@src/lib/functions/treeProcessing/building/buildTreeFromFiber.js")
      );
      const { applyEmptyNodeFilter } = vi.mocked(
        await import("@src/lib/functions/treeProcessing/filtering/applyEmptyNodeFilter.js")
      );
      const { logGroup } = vi.mocked(
        await import("@src/lib/functions/log.js")
      );

      const mockTreeNode = {
        componentName: "TestComponent",
        displayName: "TestComponent",
        depth: 0,
        renderType: "Rendering" as const,
        flags: 0,
        stateChanges: [],
        propChanges: [],
        componentLogs: [],
        isTracked: false,
        trackingGUID: null,
        hasIdenticalValueWarning: false,
      };
      buildTreeFromFiber.mockReturnValue([mockTreeNode]);
      applyEmptyNodeFilter.mockReturnValue(vi.fn((nodes) => {return nodes}));

      const root = { current: {} };

      // Clear state
      const { resetRenderCycleCounter } = await import("@src/lib/types/globalState.js");
      const { getOrCreateSharedControl } = await import("@src/lib/functions/getOrCreateSharedControl.js");
      resetRenderCycleCounter();

      // Enable tracer AFTER resetRenderCycleCounter
      getOrCreateSharedControl().isIntendedToBeEnabled = true;

      // First render
      detectUpdatedComponents(root);
      expect(logGroup).toHaveBeenCalledWith("Component render cycle 1:");

      // Second render
      detectUpdatedComponents(root);
      expect(logGroup).toHaveBeenCalledWith("Component render cycle 2:");

      // Third render
      detectUpdatedComponents(root);
      expect(logGroup).toHaveBeenCalledWith("Component render cycle 3:");
    });

    it("should show filtered count when cycles are filtered", async () => {
      const { buildTreeFromFiber } = vi.mocked(
        await import("@src/lib/functions/treeProcessing/building/buildTreeFromFiber.js")
      );
      const { applyEmptyNodeFilter } = vi.mocked(
        await import("@src/lib/functions/treeProcessing/filtering/applyEmptyNodeFilter.js")
      );
      const { logGroup } = vi.mocked(
        await import("@src/lib/functions/log.js")
      );

      const mockTreeNode = {
        componentName: "TestComponent",
        displayName: "TestComponent",
        depth: 0,
        renderType: "Rendering" as const,
        flags: 0,
        stateChanges: [],
        propChanges: [],
        componentLogs: [],
        isTracked: false,
        trackingGUID: null,
        hasIdenticalValueWarning: false,
      };

      const root = { current: {} };

      // Clear state
      const { resetRenderCycleCounter } = await import("@src/lib/types/globalState.js");
      const { getOrCreateSharedControl } = await import("@src/lib/functions/getOrCreateSharedControl.js");
      resetRenderCycleCounter();

      // Enable tracer AFTER resetRenderCycleCounter
      getOrCreateSharedControl().isIntendedToBeEnabled = true;

      // First render with nodes (cycle 1)
      buildTreeFromFiber.mockReturnValue([mockTreeNode]);
      applyEmptyNodeFilter.mockReturnValue(vi.fn((nodes) => {return nodes}));
      detectUpdatedComponents(root);
      expect(logGroup).toHaveBeenCalledWith("Component render cycle 1:");

      // Second render - filtered out (cycle 2, no output)
      buildTreeFromFiber.mockReturnValue([mockTreeNode]);
      applyEmptyNodeFilter.mockReturnValue(vi.fn(() => {return []})); // Filter removes all nodes
      detectUpdatedComponents(root);
      expect(logGroup).not.toHaveBeenCalledWith("Component render cycle 2:");

      // Third render - filtered out (cycle 3, no output)
      detectUpdatedComponents(root);
      expect(logGroup).not.toHaveBeenCalledWith("Component render cycle 3:");

      // Fourth render with nodes (cycle 4, should show "2 filtered")
      applyEmptyNodeFilter.mockReturnValue(vi.fn((nodes) => {return nodes})); // Show nodes again
      detectUpdatedComponents(root);
      expect(logGroup).toHaveBeenCalledWith("Component render cycle 4 (2 filtered):");
    });

    it("should reset filtered count after displaying a cycle", async () => {
      const { buildTreeFromFiber } = vi.mocked(
        await import("@src/lib/functions/treeProcessing/building/buildTreeFromFiber.js")
      );
      const { applyEmptyNodeFilter } = vi.mocked(
        await import("@src/lib/functions/treeProcessing/filtering/applyEmptyNodeFilter.js")
      );
      const { logGroup } = vi.mocked(
        await import("@src/lib/functions/log.js")
      );

      const mockTreeNode = {
        componentName: "TestComponent",
        displayName: "TestComponent",
        depth: 0,
        renderType: "Rendering" as const,
        flags: 0,
        stateChanges: [],
        propChanges: [],
        componentLogs: [],
        isTracked: false,
        trackingGUID: null,
        hasIdenticalValueWarning: false,
      };

      const root = { current: {} };

      // Clear state
      const { resetRenderCycleCounter } = await import("@src/lib/types/globalState.js");
      const { getOrCreateSharedControl } = await import("@src/lib/functions/getOrCreateSharedControl.js");
      resetRenderCycleCounter();

      // Enable tracer AFTER resetRenderCycleCounter
      getOrCreateSharedControl().isIntendedToBeEnabled = true;

      // Cycle 1 with nodes
      buildTreeFromFiber.mockReturnValue([mockTreeNode]);
      applyEmptyNodeFilter.mockReturnValue(vi.fn((nodes) => {return nodes}));
      detectUpdatedComponents(root);
      expect(logGroup).toHaveBeenCalledWith("Component render cycle 1:");

      // Cycle 2 filtered
      applyEmptyNodeFilter.mockReturnValue(vi.fn(() => {return []}));
      detectUpdatedComponents(root);

      // Cycle 3 with nodes (1 filtered)
      applyEmptyNodeFilter.mockReturnValue(vi.fn((nodes) => {return nodes}));
      detectUpdatedComponents(root);
      expect(logGroup).toHaveBeenCalledWith("Component render cycle 3 (1 filtered):");

      // Cycle 4 with nodes immediately after (0 filtered)
      detectUpdatedComponents(root);
      expect(logGroup).toHaveBeenCalledWith("Component render cycle 4:");
    });

    it("should increment total counter even when cycles are filtered", async () => {
      const { buildTreeFromFiber } = vi.mocked(
        await import("@src/lib/functions/treeProcessing/building/buildTreeFromFiber.js")
      );
      const { applyEmptyNodeFilter } = vi.mocked(
        await import("@src/lib/functions/treeProcessing/filtering/applyEmptyNodeFilter.js")
      );
      const { logGroup } = vi.mocked(
        await import("@src/lib/functions/log.js")
      );

      const mockTreeNode = {
        componentName: "TestComponent",
        displayName: "TestComponent",
        depth: 0,
        renderType: "Rendering" as const,
        flags: 0,
        stateChanges: [],
        propChanges: [],
        componentLogs: [],
        isTracked: false,
        trackingGUID: null,
        hasIdenticalValueWarning: false,
      };

      const root = { current: {} };

      // Clear state
      const { resetRenderCycleCounter } = await import("@src/lib/types/globalState.js");
      const { getOrCreateSharedControl } = await import("@src/lib/functions/getOrCreateSharedControl.js");
      resetRenderCycleCounter();

      // Enable tracer AFTER resetRenderCycleCounter
      getOrCreateSharedControl().isIntendedToBeEnabled = true;

      buildTreeFromFiber.mockReturnValue([mockTreeNode]);

      // All cycles filtered
      applyEmptyNodeFilter.mockReturnValue(vi.fn(() => {return []}));
      detectUpdatedComponents(root); // Cycle 1
      detectUpdatedComponents(root); // Cycle 2
      detectUpdatedComponents(root); // Cycle 3

      // Now show nodes - should be cycle 4 with 3 filtered
      applyEmptyNodeFilter.mockReturnValue(vi.fn((nodes) => {return nodes}));
      detectUpdatedComponents(root);
      expect(logGroup).toHaveBeenCalledWith("Component render cycle 4 (3 filtered):");
    });
  });

  describe("start trigger re-arm behavior", () => {
    /** @type {import("@src/lib/functions/treeProcessing/types/TreeNode.js").TreeNode} */
    const headerNode = {
      componentName: "Header",
      displayName: "Header",
      depth: 0,
      renderType: "Rendering" as const,
      flags: 0,
      stateChanges: [],
      propChanges: [],
      componentLogs: [],
      isTracked: false,
      trackingGUID: null,
      hasIdenticalValueWarning: false,
    };

    afterEach(async () => {
      const { resetTriggerState } = await import(
        "@src/lib/functions/triggers/triggerState.js"
      );
      const { getOrCreateSharedControl } = await import("@src/lib/functions/getOrCreateSharedControl.js");
      getOrCreateSharedControl().isIntendedToBeEnabled = true;
      resetTriggerState();
      updateCachedStartTrigger(null);
      setAutoStartCallback(null);
    });

    it("in 'once' mode: start trigger fires only once even when trigger component renders multiple times", async () => {
      const { buildTreeFromFiber } = vi.mocked(
        await import(
          "@src/lib/functions/treeProcessing/building/buildTreeFromFiber.js"
        )
      );
      const { resetTriggerState } = await import(
        "@src/lib/functions/triggers/triggerState.js"
      );
      const { getOrCreateSharedControl } = await import("@src/lib/functions/getOrCreateSharedControl.js");
      resetTriggerState();
      const autoStartSpy = vi.fn();
      setAutoStartCallback(autoStartSpy);
      getOrCreateSharedControl().isIntendedToBeEnabled = false;
      updateCachedStartTrigger("Header");
      updateCachedTriggerRearmMode("once");
      buildTreeFromFiber.mockReturnValue([headerNode]);

      const root = { current: {} };

      // First render — start trigger fires
      detectUpdatedComponents(root);
      expect(autoStartSpy).toHaveBeenCalledTimes(1);

      // Second render — must NOT fire again in "once" mode
      detectUpdatedComponents(root);
      expect(autoStartSpy).toHaveBeenCalledTimes(1);
    });

    it("in 'always' mode: start trigger fires each time trigger component renders while tracer is stopped", async () => {
      const { buildTreeFromFiber } = vi.mocked(
        await import(
          "@src/lib/functions/treeProcessing/building/buildTreeFromFiber.js"
        )
      );
      const { resetTriggerState } = await import(
        "@src/lib/functions/triggers/triggerState.js"
      );
      const { getOrCreateSharedControl } = await import("@src/lib/functions/getOrCreateSharedControl.js");
      resetTriggerState();
      const autoStartSpy = vi.fn();
      setAutoStartCallback(autoStartSpy);
      getOrCreateSharedControl().isIntendedToBeEnabled = false;
      updateCachedStartTrigger("Header");
      updateCachedTriggerRearmMode("always");
      buildTreeFromFiber.mockReturnValue([headerNode]);

      const root = { current: {} };

      // First render — start trigger fires
      detectUpdatedComponents(root);
      expect(autoStartSpy).toHaveBeenCalledTimes(1);

      // Simulate "always" re-arm: reset trigger state as would happen after end trigger
      resetTriggerState();

      // Second render — should fire again in "always" mode
      detectUpdatedComponents(root);
      expect(autoStartSpy).toHaveBeenCalledTimes(2);
    });
  });
});
