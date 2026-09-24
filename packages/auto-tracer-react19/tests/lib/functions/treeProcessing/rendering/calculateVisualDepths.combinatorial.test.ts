/* eslint-disable no-console */
/* eslint-disable local-rules/no-console-disallow */
/**
 * Combinatorial test coverage for calculateVisualDepths
 * Tests all combinations of marker/component patterns at various depths
 */

import { describe, expect, it } from "vitest";
import type { TreeNode } from "@src/lib/functions/treeProcessing/types/TreeNode";
import { calculateVisualDepths } from "@src/lib/functions/treeProcessing/rendering/helpers/calculateVisualDepths";

/**
 * Helper to create a marker node
 */
function createMarker(
  originalDepth: number,
  collapsedLevels: number
): TreeNode {
  return {
    depth: originalDepth,
    componentName: `... (${collapsedLevels} levels collapsed)`,
    displayName: `... (${collapsedLevels} levels collapsed)`,
    renderType: "Marker",
    flags: 0,
    stateChanges: [],
    propChanges: [],
    componentLogs: [],
    isTracked: false,
    trackingGUID: null,
    hasIdenticalValueWarning: false,
    filteredNodeCount: collapsedLevels,
  };
}

/**
 * Helper to create a component node
 */
function createComponent(originalDepth: number, name: string): TreeNode {
  return {
    depth: originalDepth,
    componentName: name,
    displayName: name,
    renderType: "Mount",
    flags: 0,
    stateChanges: [],
    propChanges: [],
    componentLogs: [],
    isTracked: false,
    trackingGUID: null,
    hasIdenticalValueWarning: false,
  };
}

/**
 * Verify visual depths match expected values
 */
function expectVisualDepths(
  nodes: readonly TreeNode[],
  expected: readonly number[]
): void {
  const actual = calculateVisualDepths(nodes);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    console.log('\n❌ MISMATCH:');
    console.log(
      '  Nodes:',
      nodes
        .map((n) => {
          return `${n.renderType}(${n.depth})`;
        })
        .join(' → ')
    );
    console.log('  Expected:', expected);
    console.log('  Got:     ', actual);
  }
  expect(actual).toEqual(expected);
}

describe("calculateVisualDepths - Combinatorial Coverage", () => {
  describe("Single Level Patterns", () => {
    describe("Marker-Component (MC)", () => {
      it("M(0) → C(5): component is child of marker", () => {
        expectVisualDepths(
          [createMarker(0, 5), createComponent(5, "Child")],
          [0, 1]
        );
      });

      it("M(0) → C(0): component at same level is child", () => {
        expectVisualDepths(
          [createMarker(0, 3), createComponent(0, "Child")],
          [0, 1]
        );
      });

      it("M(10) → C(15): deep marker with child", () => {
        expectVisualDepths(
          [createMarker(10, 5), createComponent(15, "Child")],
          [0, 1]
        );
      });
    });

    describe("Marker-Marker (MM)", () => {
      it("M(0) → M(0): siblings at same depth", () => {
        expectVisualDepths([createMarker(0, 3), createMarker(0, 3)], [0, 0]);
      });

      it("M(0) → M(5): second deeper is sibling", () => {
        expectVisualDepths([createMarker(0, 3), createMarker(5, 3)], [0, 0]);
      });

      it("M(5) → M(3): second shallower uses tracked depth", () => {
        expectVisualDepths([createMarker(5, 3), createMarker(3, 2)], [0, 0]);
      });

      it("M(5) → M(10): both at visual depth 0", () => {
        expectVisualDepths([createMarker(5, 3), createMarker(10, 5)], [0, 0]);
      });
    });

    describe("Component-Marker (CM)", () => {
      it("C(0) → M(5): marker is sibling to component", () => {
        expectVisualDepths(
          [createComponent(0, "App"), createMarker(5, 3)],
          [0, 0]
        );
      });

      it("C(5) → M(5): marker at same level is sibling", () => {
        expectVisualDepths(
          [createComponent(5, "App"), createMarker(5, 3)],
          [0, 0]
        );
      });

      it("C(5) → M(10): deeper marker is sibling", () => {
        expectVisualDepths(
          [createComponent(5, "App"), createMarker(10, 3)],
          [0, 0]
        );
      });

      it("C(10) → M(5): shallower marker goes back", () => {
        expectVisualDepths(
          [createComponent(10, "Deep"), createMarker(5, 3)],
          [0, 0]
        );
      });
    });

    describe("Component-Component (CC)", () => {
      it("C(0) → C(0): siblings at same depth", () => {
        expectVisualDepths(
          [createComponent(0, "First"), createComponent(0, "Second")],
          [0, 0]
        );
      });

      it("C(0) → C(5): second is child of first", () => {
        expectVisualDepths(
          [createComponent(0, "Parent"), createComponent(5, "Child")],
          [0, 1]
        );
      });

      it("C(5) → C(3): second shallower is sibling to ancestor", () => {
        expectVisualDepths(
          [createComponent(5, "Deep"), createComponent(3, "Shallow")],
          [0, 0]
        );
      });

      it("C(5) → C(10): nested child", () => {
        expectVisualDepths(
          [createComponent(5, "Parent"), createComponent(10, "Child")],
          [0, 1]
        );
      });
    });
  });

  describe("Two Level Patterns", () => {
    describe("Marker-Component-Marker (MCM)", () => {
      it("M(0) → C(5) → M(5): second marker is sibling to component", () => {
        expectVisualDepths(
          [createMarker(0, 5), createComponent(5, "App"), createMarker(5, 3)],
          [0, 1, 1]
        );
      });

      it("M(0) → C(5) → M(10): deeper marker is sibling to component", () => {
        expectVisualDepths(
          [createMarker(0, 5), createComponent(5, "App"), createMarker(10, 3)],
          [0, 1, 1]
        );
      });

      it("M(0) → C(5) → M(0): marker returns to root", () => {
        expectVisualDepths(
          [createMarker(0, 5), createComponent(5, "App"), createMarker(0, 3)],
          [0, 1, 0]
        );
      });

      it("M(5) → C(10) → M(15): all deeper levels", () => {
        expectVisualDepths(
          [
            createMarker(5, 5),
            createComponent(10, "Deep"),
            createMarker(15, 3),
          ],
          [0, 1, 1]
        );
      });

      it("M(10) → C(15) → M(5): marker goes up", () => {
        expectVisualDepths(
          [
            createMarker(10, 5),
            createComponent(15, "Deep"),
            createMarker(5, 3),
          ],
          [0, 1, 0]
        );
      });
    });

    describe("Marker-Marker-Component (MMC)", () => {
      it("M(0) → M(0) → C(5): component is child of last marker", () => {
        expectVisualDepths(
          [createMarker(0, 3), createMarker(0, 3), createComponent(5, "Child")],
          [0, 0, 1]
        );
      });

      it("M(0) → M(5) → C(10): component after deeper marker", () => {
        expectVisualDepths(
          [
            createMarker(0, 3),
            createMarker(5, 3),
            createComponent(10, "Child"),
          ],
          [0, 0, 1]
        );
      });

      it("M(5) → M(3) → C(8): mixed depths", () => {
        expectVisualDepths(
          [createMarker(5, 3), createMarker(3, 2), createComponent(8, "Child")],
          [0, 0, 1]
        );
      });

      it("M(0) → M(10) → C(10): component at same level as second marker", () => {
        expectVisualDepths(
          [
            createMarker(0, 5),
            createMarker(10, 3),
            createComponent(10, "Child"),
          ],
          [0, 0, 1]
        );
      });
    });

    describe("Component-Marker-Component (CMC)", () => {
      it("C(0) → M(5) → C(10): linear progression", () => {
        expectVisualDepths(
          [
            createComponent(0, "App"),
            createMarker(5, 3),
            createComponent(10, "Child"),
          ],
          [0, 0, 1]
        );
      });

      it("C(5) → M(5) → C(10): marker at same level", () => {
        expectVisualDepths(
          [
            createComponent(5, "App"),
            createMarker(5, 3),
            createComponent(10, "Child"),
          ],
          [0, 0, 1]
        );
      });

      it("C(5) → M(10) → C(15): all deeper", () => {
        expectVisualDepths(
          [
            createComponent(5, "Parent"),
            createMarker(10, 3),
            createComponent(15, "Child"),
          ],
          [0, 0, 1]
        );
      });

      it("C(10) → M(5) → C(15): marker goes up then component deeper", () => {
        expectVisualDepths(
          [
            createComponent(10, "Deep"),
            createMarker(5, 3),
            createComponent(15, "Child"),
          ],
          [0, 0, 1]
        );
      });

      it("C(5) → M(10) → C(5): component returns to earlier level", () => {
        expectVisualDepths(
          [
            createComponent(5, "Deep"),
            createMarker(10, 3),
            createComponent(5, "Back"),
          ],
          [0, 0, 0]
        );
      });
    });

    describe("Component-Component-Marker (CCM)", () => {
      it("C(0) → C(5) → M(10): marker after nested components", () => {
        expectVisualDepths(
          [
            createComponent(0, "Parent"),
            createComponent(5, "Child"),
            createMarker(10, 3),
          ],
          [0, 1, 1]
        );
      });

      it("C(0) → C(0) → M(5): marker after siblings", () => {
        expectVisualDepths(
          [
            createComponent(0, "First"),
            createComponent(0, "Second"),
            createMarker(5, 3),
          ],
          [0, 0, 0]
        );
      });

      it("C(5) → C(10) → M(10): marker at same level as last component", () => {
        expectVisualDepths(
          [
            createComponent(5, "Parent"),
            createComponent(10, "Child"),
            createMarker(10, 3),
          ],
          [0, 1, 1]
        );
      });

      it("C(10) → C(5) → M(15): marker after going up", () => {
        expectVisualDepths(
          [
            createComponent(10, "Deep"),
            createComponent(5, "Shallow"),
            createMarker(15, 3),
          ],
          [0, 0, 0]
        );
      });
    });
  });

  describe("Three Level Patterns", () => {
    describe("Real-world Tree Structures", () => {
      it("M(0) → C(19) → M(4) → C(8) → M(8) → C(15): user's screenshot scenario", () => {
        expectVisualDepths(
          [
            createMarker(0, 19),
            createComponent(19, "AppLayout"),
            createMarker(4, 4),
            createComponent(8, "AppHeader"),
            createMarker(8, 8),
            createComponent(15, "TasksPage"),
          ],
          [0, 1, 0, 1, 1, 2]
        );
      });

      it("M(20) → C(21) → M(24) → C(24) → C(24): exact user screenshot - marker after component at deeper level", () => {
        // This is the EXACT scenario from user's screenshot
        // Marker(20) at depth 0
        // AppLayout at depth 21 (child of marker) → visual depth 1
        // Marker(24) represents filtered children of AppLayout → should be visual depth 1 (SAME as AppLayout)
        // AppHeader at depth 24 (child of AppLayout) → visual depth 2
        // AppSidebar at depth 24 (sibling of AppHeader) → visual depth 2
        const nodes = [
          createMarker(20, 19),           // Level 20, filtered 19 nodes
          createComponent(21, "AppLayout"),  // Original depth 21
          createMarker(24, 4),            // Level 24, filtered 4 nodes (represents AppLayout's filtered children)
          createComponent(24, "AppHeader"),  // Original depth 24
          createComponent(24, "AppSidebar"), // Original depth 24
        ];
        const result = calculateVisualDepths(nodes);
        console.log("EXACT USER SCENARIO - Calculated depths:", result);
        console.log("Expected depths:                        ", [0, 1, 1, 2, 2]);
        expectVisualDepths(
          nodes,
          [0, 1, 1, 2, 2]  // Expected: marker at same depth as component, then children deeper
        );
      });

      it("M(0) → C(5) → M(5) → C(10) → M(5) → C(15): alternating pattern", () => {
        expectVisualDepths(
          [
            createMarker(0, 5),
            createComponent(5, "First"),
            createMarker(5, 3),
            createComponent(10, "Second"),
            createMarker(5, 3),
            createComponent(15, "Third"),
          ],
          [0, 1, 1, 2, 1, 2]
        );
      });

      it("M(0) → M(0) → M(0) → C(5): multiple markers then component", () => {
        expectVisualDepths(
          [
            createMarker(0, 3),
            createMarker(0, 3),
            createMarker(0, 3),
            createComponent(5, "Child"),
          ],
          [0, 0, 0, 1]
        );
      });

      it("C(0) → C(5) → C(10) → M(15) → C(20): deep nesting then marker", () => {
        expectVisualDepths(
          [
            createComponent(0, "L1"),
            createComponent(5, "L2"),
            createComponent(10, "L3"),
            createMarker(15, 3),
            createComponent(20, "L4"),
          ],
          [0, 1, 2, 2, 3]
        );
      });

      it("M(5) → C(10) → M(10) → C(15) → M(15) → C(20): stairs pattern", () => {
        expectVisualDepths(
          [
            createMarker(5, 5),
            createComponent(10, "A"),
            createMarker(10, 5),
            createComponent(15, "B"),
            createMarker(15, 5),
            createComponent(20, "C"),
          ],
          [0, 1, 1, 2, 2, 3]
        );
      });
    });

    describe("Going Up the Tree", () => {
      it("C(15) → M(10) → C(5): progressive decrease", () => {
        expectVisualDepths(
          [
            createComponent(15, "Deep"),
            createMarker(10, 3),
            createComponent(5, "Shallow"),
          ],
          [0, 0, 0]
        );
      });

      it("M(20) → C(15) → M(10) → C(5): zigzag up", () => {
        expectVisualDepths(
          [
            createMarker(20, 5),
            createComponent(15, "L1"),
            createMarker(10, 3),
            createComponent(5, "L2"),
          ],
          [0, 0, 0, 0]
        );
      });

      it("C(20) → C(15) → C(10) → M(5) → C(3): all decreasing", () => {
        expectVisualDepths(
          [
            createComponent(20, "D4"),
            createComponent(15, "D3"),
            createComponent(10, "D2"),
            createMarker(5, 3),
            createComponent(3, "D1"),
          ],
          [0, 0, 0, 0, 0]
        );
      });
    });

    describe("Complex Mixed Patterns", () => {
      it("M(0) → C(10) → M(20) → M(15) → C(25): marker after marker at different depths", () => {
        expectVisualDepths(
          [
            createMarker(0, 10),
            createComponent(10, "App"),
            createMarker(20, 5),
            createMarker(15, 3),
            createComponent(25, "Deep"),
          ],
          [0, 1, 1, 0, 1]
        );
      });

      it("C(5) → M(10) → C(15) → C(15) → M(20): siblings after marker", () => {
        expectVisualDepths(
          [
            createComponent(5, "Parent"),
            createMarker(10, 5),
            createComponent(15, "Child1"),
            createComponent(15, "Child2"),
            createMarker(20, 3),
          ],
          [0, 0, 1, 1, 1]
        );
      });

      it("M(0) → M(5) → C(10) → C(10) → M(15) → C(20): marker siblings, component siblings, then deeper", () => {
        expectVisualDepths(
          [
            createMarker(0, 5),
            createMarker(5, 5),
            createComponent(10, "A"),
            createComponent(10, "B"),
            createMarker(15, 5),
            createComponent(20, "C"),
          ],
          [0, 0, 1, 1, 1, 2]
        );
      });
    });
  });

  describe("Edge Cases", () => {
    it("single marker at depth 0", () => {
      expectVisualDepths([createMarker(0, 5)], [0]);
    });

    it("single component at depth 0", () => {
      expectVisualDepths([createComponent(0, "App")], [0]);
    });

    it("single marker at depth 100", () => {
      expectVisualDepths([createMarker(100, 5)], [0]);
    });

    it("M(0) → C(0) → C(0) → C(0): all at same original depth", () => {
      expectVisualDepths(
        [
          createMarker(0, 3),
          createComponent(0, "A"),
          createComponent(0, "B"),
          createComponent(0, "C"),
        ],
        [0, 1, 1, 1]
      );
    });

    it("extreme depth changes: M(0) → C(100) → M(50) → C(150)", () => {
      expectVisualDepths(
        [
          createMarker(0, 100),
          createComponent(100, "Deep"),
          createMarker(50, 50),
          createComponent(150, "VeryDeep"),
        ],
        [0, 1, 0, 1]
      );
    });
  });

  describe("Sibling Patterns", () => {
    it("three markers at same depth are all siblings", () => {
      expectVisualDepths(
        [createMarker(5, 3), createMarker(5, 3), createMarker(5, 3)],
        [0, 0, 0]
      );
    });

    it("three components at same depth are all siblings", () => {
      expectVisualDepths(
        [
          createComponent(5, "A"),
          createComponent(5, "B"),
          createComponent(5, "C"),
        ],
        [0, 0, 0]
      );
    });

    it("alternating markers and components at same depth", () => {
      expectVisualDepths(
        [
          createMarker(5, 3),
          createComponent(5, "A"),
          createMarker(5, 3),
          createComponent(5, "B"),
        ],
        [0, 1, 1, 2]
      );
    });
  });

  describe("Parent-Child Patterns", () => {
    it("marker with multiple children at increasing depths", () => {
      expectVisualDepths(
        [
          createMarker(0, 10),
          createComponent(10, "Child1"),
          createComponent(15, "Child2"),
          createComponent(20, "Child3"),
        ],
        [0, 1, 2, 3]
      );
    });

    it("marker with children at same depth", () => {
      expectVisualDepths(
        [
          createMarker(0, 10),
          createComponent(10, "Child1"),
          createComponent(10, "Child2"),
          createComponent(10, "Child3"),
        ],
        [0, 1, 1, 1]
      );
    });

    it("component with marker siblings", () => {
      expectVisualDepths(
        [createComponent(0, "Parent"), createMarker(5, 3), createMarker(10, 3)],
        [0, 0, 0]
      );
    });
  });
});
