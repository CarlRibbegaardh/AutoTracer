import { beforeEach, describe, expect, it, vi } from "vitest";
import { createConsoleGroupRenderer } from "@src/lib/functions/treeProcessing/rendering/renderers/createConsoleGroupRenderer";
import type { TreeNode } from "@src/lib/functions/treeProcessing/types/TreeNode";

// Mock the log module
const mockLog = vi.hoisted(() => {
  return {
    log: vi.fn(),
    logStyled: vi.fn(),
    logGroup: vi.fn(),
    logGroupEnd: vi.fn(),
    logReconciled: vi.fn(),
    logSkipped: vi.fn(),
    logStateChange: vi.fn(),
    logIdenticalStateValueWarning: vi.fn(),
    groupStyled: vi.fn(),
    groupReconciled: vi.fn(),
    groupSkipped: vi.fn(),
  };
});

// Create a mutable options object for testing
const mockTraceOptions = vi.hoisted(() => {
  return {
    showLevelDetails: false,
  };
});

vi.mock("@src/lib/functions/log.js", () => {
  return mockLog;
});

// Mock globalState to control traceOptions
vi.mock("@src/lib/types/globalState.js", () => {
  return {
    getTraceOptions: () => mockTraceOptions,
  };
});

// Helper to create mock nodes
const createMockNode = (
  depth: number,
  renderType: TreeNode["renderType"] = "Rendering",
  displayName = "TestComponent",
  filteredNodeCount = 0
): TreeNode => {
  return {
    depth,
    renderType,
    componentName: displayName,
    displayName,
    flags: 0,
    stateChanges: [],
    propChanges: [],
    componentLogs: [],
    isTracked: true,
    trackingGUID: null,
    hasIdenticalValueWarning: false,
    filteredNodeCount,
  };
};

describe("createConsoleGroupRenderer - Marker Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset options
    mockTraceOptions.showLevelDetails = false;
  });

  it("should SKIP marker row when internals logging is OFF", () => {
    mockTraceOptions.showLevelDetails = false;
    const renderer = createConsoleGroupRenderer();
    const nodes = [
      createMockNode(0, "Marker", "... (5 empty levels)", 5),
      createMockNode(5, "Rendering", "DeepComponent"),
    ];

    renderer(nodes);

    // Should NOT log "..." or any marker info
    expect(mockLog.log).not.toHaveBeenCalledWith(expect.stringContaining("..."));

    // Should still render the next component
    expect(mockLog.logStyled).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining("DeepComponent"),
      expect.anything()
    );
  });

  it("should LOG detailed marker info when internals logging is ON", () => {
    mockTraceOptions.showLevelDetails = true;
    const renderer = createConsoleGroupRenderer();
    const nodes = [
      createMockNode(0, "Marker", "... (5 empty levels)", 5),
      createMockNode(5, "Rendering", "DeepComponent"),
    ];

    renderer(nodes);

    // Should log detailed info
    // Expected: ... (Level: 5, Filtered nodes: 5)
    expect(mockLog.log).toHaveBeenCalledWith(
      expect.stringContaining("... (Level: 5, Filtered nodes: 5)")
    );
  });
});
