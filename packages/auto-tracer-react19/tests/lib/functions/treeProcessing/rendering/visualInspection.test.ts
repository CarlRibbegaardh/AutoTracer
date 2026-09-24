import { beforeEach, describe, it } from "vitest";
import { renderTree } from "../../../../../src/lib/functions/treeProcessing/rendering/renderTree";
import type { TreeNode } from "../../../../../src/lib/functions/treeProcessing/types/TreeNode";
import { traceOptions } from "../../../../../src/lib/types/globalState";

/**
 * Visual inspection tests for text-based indent rendering and filtering.
 *
 * These tests OUTPUT to console for manual visual inspection of:
 * 1. Trailing collapsed level markers
 * 2. Tree level marker alignment with branches
 * 3. Overall visual coherence
 *
 * Run with: pnpm --filter @autotracer/react19 test visualInspection --run
 */

/**
 * Helper to create a rendering node for testing
 */
function createRenderingNode(
  depth: number,
  componentName: string,
  hasStateChange = true
): TreeNode {
  return {
    depth,
    componentName,
    displayName: componentName,
    renderType: "Rendering",
    flags: 0,
    stateChanges: hasStateChange
      ? [
          {
            name: "todos",
            value: [{ id: 1, text: "Test" }],
            prevValue: [],
            hook: {
              memoizedState: [{ id: 1, text: "Test" }],
              queue: null,
              next: null,
            },
          },
        ]
      : [],
    propChanges: [],
    componentLogs: [],
    isTracked: false,
    trackingGUID: null,
    hasIdenticalValueWarning: false,
  };
}

/**
 * Helper to create a marker node for testing
 */
function createMarkerNode(depth: number, count: number): TreeNode {
  return {
    depth,
    componentName: `... (${count} levels collapsed)`,
    displayName: `... (${count} levels collapsed)`,
    renderType: "Marker",
    flags: 0,
    stateChanges: [],
    propChanges: [],
    componentLogs: [],
    isTracked: false,
    trackingGUID: null,
    hasIdenticalValueWarning: false,
    filteredNodeCount: count,
  };
}

/**
 * Helper to create a reconciled node for testing
 */
function createReconciledNode(depth: number, componentName: string): TreeNode {
  return {
    depth,
    componentName,
    displayName: componentName,
    renderType: "Reconciled",
    flags: 0,
    stateChanges: [],
    propChanges: [],
    componentLogs: [],
    isTracked: false,
    trackingGUID: null,
    hasIdenticalValueWarning: false,
  };
}

describe("Visual Inspection - Text-based Indent and Filtering", () => {
  beforeEach(() => {
    traceOptions.showLevelDetails = false;
  });

  describe("Potential Issue 1: Trailing collapsed markers", () => {
    it("should show trailing marker at end of tree", () => {
      console.log("\n=== SCENARIO: Tree ending with collapsed marker ===");

      const nodes: readonly TreeNode[] = [
        createMarkerNode(0, 5), // Root marker
        createRenderingNode(5, "TodoList"), // Content
        createMarkerNode(6, 10), // TRAILING MARKER at deeper level
      ];

      renderTree(nodes);

      console.log("\nEXPECTED: Marker should show but not look orphaned");
      console.log("INSPECT: Does the trailing marker look correct?");
      console.log("=========================================\n");
    });

    it("should show trailing marker at same level as previous content", () => {
      console.log("\n=== SCENARIO: Tree ending with sibling marker ===");

      const nodes: readonly TreeNode[] = [
        createMarkerNode(0, 5), // Root marker
        createRenderingNode(5, "TodoList"), // Content
        createMarkerNode(5, 3), // TRAILING MARKER at SAME level (sibling)
      ];

      renderTree(nodes);

      console.log("\nEXPECTED: Marker should be at same indent as TodoList");
      console.log("INSPECT: Does the sibling marker alignment look correct?");
      console.log("=========================================\n");
    });
  });

  describe("Potential Issue 2: Tree level marker alignment", () => {
    it("should show connector lines aligning with component branches", () => {
      console.log("\n=== SCENARIO: Deep nesting with connectors ===");

      const nodes: readonly TreeNode[] = [
        createReconciledNode(0, "App"),
        createReconciledNode(1, "Provider"),
        createReconciledNode(2, "Theme"),
        createRenderingNode(3, "TodoList"),
        createRenderingNode(4, "TodoItem"),
        createRenderingNode(5, "Checkbox"),
      ];

      renderTree(nodes);

      console.log("\nEXPECTED: Each level should have properly aligned ├─ markers");
      console.log("INSPECT: Do the tree branches align correctly?");
      console.log("=========================================\n");
    });

    it("should show connectors with jump from shallow to deep", () => {
      console.log("\n=== SCENARIO: Depth jump triggering intermediate connectors ===");

      const nodes: readonly TreeNode[] = [
        createReconciledNode(0, "App"),
        createRenderingNode(5, "DeepComponent"), // Jump from 0 to 5
      ];

      renderTree(nodes);

      console.log("\nEXPECTED: Should show connectors for levels 1,2,3,4,5");
      console.log("INSPECT: Are intermediate connector lines present and aligned?");
      console.log("=========================================\n");
    });

    it("should NOT show connectors after marker", () => {
      console.log("\n=== SCENARIO: Marker should suppress connectors ===");

      const nodes: readonly TreeNode[] = [
        createMarkerNode(0, 5), // Marker collapses levels 0-4
        createRenderingNode(5, "TodoList"), // Jump to level 5
      ];

      renderTree(nodes);

      console.log("\nEXPECTED: NO connectors between marker and TodoList");
      console.log("INSPECT: Are there unwanted connector lines?");
      console.log("=========================================\n");
    });
  });

  describe("Potential Issue 3: Multiple markers in sequence", () => {
    it("should handle consecutive markers without extra connectors", () => {
      console.log("\n=== SCENARIO: Multiple markers in a row ===");

      const nodes: readonly TreeNode[] = [
        createMarkerNode(0, 5),
        createMarkerNode(5, 3),
        createMarkerNode(8, 2),
        createRenderingNode(10, "TodoList"),
      ];

      renderTree(nodes);

      console.log("\nEXPECTED: Markers should stack without intermediate connectors");
      console.log("INSPECT: Are there unwanted lines between markers?");
      console.log("=========================================\n");
    });
  });

  describe("Potential Issue 4: Complex real-world scenario", () => {
    it("should handle realistic app structure with filtering", () => {
      console.log("\n=== SCENARIO: Realistic filtered app tree ===");

      const nodes: readonly TreeNode[] = [
        createMarkerNode(0, 21), // Many parent wrappers collapsed
        createRenderingNode(21, "TodoApp"),
        createRenderingNode(22, "TodoList"),
        createMarkerNode(22, 1), // Going back UP (sibling to TodoList)
        createRenderingNode(23, "TodoItem"),
        createRenderingNode(24, "Checkbox"),
        createMarkerNode(24, 2), // Sibling to Checkbox, collapsing some space
        createRenderingNode(26, "Label"),
      ];

      renderTree(nodes);

      console.log("\nEXPECTED: Clean hierarchy with markers integrated smoothly");
      console.log("INSPECT: Does this look like a coherent component tree?");
      console.log("INSPECT: Are markers at correct indentation?");
      console.log("INSPECT: Are there trailing markers that look orphaned?");
      console.log("=========================================\n");
    });
  });

  describe("Edge Case: Marker at root level", () => {
    it("should handle marker as first node at depth 0", () => {
      console.log("\n=== SCENARIO: Root marker (depth 0) ===");

      const nodes: readonly TreeNode[] = [
        createMarkerNode(0, 10),
        createRenderingNode(10, "Content"),
      ];

      renderTree(nodes);

      console.log("\nEXPECTED: Marker at far left, content indented once");
      console.log("INSPECT: Is the root marker properly positioned?");
      console.log("=========================================\n");
    });
  });

  describe("Edge Case: All nodes are markers", () => {
    it("should handle tree with only markers", () => {
      console.log("\n=== SCENARIO: Only markers (no actual content) ===");

      const nodes: readonly TreeNode[] = [
        createMarkerNode(0, 5),
        createMarkerNode(5, 5),
        createMarkerNode(10, 5),
      ];

      renderTree(nodes);

      console.log("\nEXPECTED: Nested markers showing structure collapse");
      console.log("INSPECT: Does this convey the collapsed structure?");
      console.log("=========================================\n");
    });
  });

  describe("REAL ISSUE: Marker→Component Depth Jump", () => {
    it("should show depth jump when marker at level 3 and component at level 6", () => {
      console.log("\n=== SCENARIO: Marker at depth 3, Component at depth 6 ===");

      const nodes: readonly TreeNode[] = [
        createMarkerNode(0, 3), // Collapses levels 0-2
        createRenderingNode(6, "DeepComponent"), // Jump from 2 to 6 (missing 3,4,5)
      ];

      renderTree(nodes);

      console.log("\nCURRENT BEHAVIOR: Component shows as direct child of marker");
      console.log("EXPECTED: Should show 3 intermediate connectors for levels 3,4,5");
      console.log("INSPECT: Does DeepComponent look like it's at depth 6?");
      console.log("=========================================\n");
    });

    it("should show multiple depth jumps after markers", () => {
      console.log("\n=== SCENARIO: Multiple markers with depth jumps ===");

      const nodes: readonly TreeNode[] = [
        createMarkerNode(0, 2), // Collapses levels 0-1
        createRenderingNode(5, "FirstDeep"), // Jump to 5 (missing 2,3,4)
        createMarkerNode(6, 2), // Collapses 6-7
        createRenderingNode(10, "SecondDeep"), // Jump to 10 (missing 8,9)
      ];

      renderTree(nodes);

      console.log("\nCURRENT BEHAVIOR: Both components show as simple children");
      console.log("EXPECTED: FirstDeep should show depth jump of 3, SecondDeep depth jump of 2");
      console.log("INSPECT: Are the depth relationships clear?");
      console.log("=========================================\n");
    });
  });
});
