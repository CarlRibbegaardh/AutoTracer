import { beforeEach, describe, expect, it } from "vitest";
import { renderTree } from "../../../../../src/lib/functions/treeProcessing/rendering/renderTree";
import type { TreeNode } from "../../../../../src/lib/functions/treeProcessing/types/TreeNode";
import { traceOptions } from "../../../../../src/lib/types/globalState";
import { applyOutputModeToReactTracerOptions } from "../../../../../src/lib/autoTracer/applyOutputModeToReactTracerOptions";

/**
 * Focused test for the specific issue reported by user:
 * "marker node on level 3 but the leaf was on level 6"
 *
 * Expected: Component at depth 6 should render at visual depth 1 (2 figure spaces)
 * Reported: Component renders with 8 spaces (visual depth 4)
 */

function captureConsoleLogs(fn: () => void): string[] {
  const logs: string[] = [];
  const originalLog = console.log;

  console.log = (...args: unknown[]) => {
    logs.push(args.map((arg) => {return String(arg)}).join(" "));
  };

  try {
    fn();
  } finally {
    console.log = originalLog;
  }

  return logs;
}

function getIndentLength(line: string): number {
  const match = line.match(/^(\u2007*)/);
  if (!match || !match[1]) {
    return 0;
  }
  return match[1].length;
}

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

function createRenderingNode(depth: number, componentName: string): TreeNode {
  return {
    depth,
    componentName,
    displayName: componentName,
    renderType: "Rendering",
    flags: 0,
    stateChanges: [
      {
        name: "count",
        value: 5,
        prevValue: 0,
        hook: {
          memoizedState: 5,
          queue: null,
          next: null,
        },
      },
    ],
    propChanges: [],
    componentLogs: [],
    isTracked: false,
    trackingGUID: null,
    hasIdenticalValueWarning: false,
  };
}

describe("User-Reported Issue: Marker Level 3, Leaf at Level 6", () => {
  beforeEach(() => {
    Object.assign(traceOptions, applyOutputModeToReactTracerOptions("copy-paste"));
    traceOptions.showLevelDetails = false;
  });

  it("should render component at visual depth 1 when marker is at depth 0-2 and component at depth 6", () => {
    // Scenario: Marker collapses levels 0, 1, 2
    // Component is at original depth 6
    // Expected visual depth: 1 (child of marker)
    // Expected indent: 2 figure spaces

    const nodes: readonly TreeNode[] = [
      createMarkerNode(0, 3), // Collapses levels 0, 1, 2 (marker ends at depth 2)
      createRenderingNode(6, "DeepComponent"), // Original depth 6
    ];

    const logs = captureConsoleLogs(() => {return renderTree(nodes)});
    const output = logs.filter((line) => {return line.trim().length > 0});
    const fullOutput = output.join("\n");

    console.log("\n=== ACTUAL OUTPUT ===");
    console.log(fullOutput);
    console.log("===================\n");

    // Find component line
    const componentLine = output.find((line) =>
      {return line.includes("[DeepComponent]")}
    );
    expect(componentLine).toBeDefined();

    // Measure indent
    const indent = getIndentLength(componentLine!);

    console.log(`Component line: ${componentLine}`);
    console.log(`Indent length: ${indent} figure spaces`);
    console.log(`Expected: 2 figure spaces (visual depth 1)`);

    // CRITICAL ASSERTION: Component should be at visual depth 1 = 2 figure spaces
    // NOT depth 4 = 8 figure spaces (which was reported as the bug)
    expect(indent).toBe(2);
    expect(indent).not.toBe(8); // This would be visual depth 4 (wrong!)
  });

  it("should NOT show intermediate connectors between marker and component", () => {
    const nodes: readonly TreeNode[] = [
      createMarkerNode(0, 3),
      createRenderingNode(6, "DeepComponent"),
    ];

    const logs = captureConsoleLogs(() => {return renderTree(nodes)});
    const output = logs.filter((line) => {return line.trim().length > 0});

    // Count lines that are ONLY connectors (no component name)
    const standaloneConnectorLines = output.filter((line) => {
      const trimmed = line.trim();
      // Match lines that are ONLY connector characters, possibly with depth labels
      return (
        trimmed.startsWith("├─") &&
        !trimmed.includes("[") && // No component name
        !trimmed.includes("collapsed") // Not a marker
      );
    });

    console.log("\n=== STANDALONE CONNECTOR LINES ===");
    standaloneConnectorLines.forEach((line, i) => {
      console.log(`${i}: "${line}"`);
    });
    console.log("===================\n");

    // After a marker, there should be NO intermediate connectors
    expect(standaloneConnectorLines.length).toBe(0);
  });

  it("should handle marker at depth 3 (not 0) with component at depth 6", () => {
    // More realistic scenario: Marker is not at root
    // DESIGN NOTE: Markers after components are siblings (represent collapsed space)
    const nodes: readonly TreeNode[] = [
      createRenderingNode(0, "App"), // Root at depth 0
      createMarkerNode(1, 3), // Marker at depth 1 (collapses 3 levels)
      createRenderingNode(6, "DeepComponent"), // Component at depth 6
    ];

    const logs = captureConsoleLogs(() => {return renderTree(nodes)});
    const output = logs.filter((line) => {return line.trim().length > 0});
    const fullOutput = output.join("\n");

    console.log("\n=== ACTUAL OUTPUT (with App) ===");
    console.log(fullOutput);
    console.log("===================\n");

    const appLine = output.find((line) => {return line.includes("[App]")});
    const markerLine = output.find((line) => {return line.includes("collapsed")});
    const componentLine = output.find((line) =>
      {return line.includes("[DeepComponent]")}
    );

    expect(appLine).toBeDefined();
    expect(markerLine).toBeDefined();
    expect(componentLine).toBeDefined();

    const appIndent = getIndentLength(appLine!);
    const markerIndent = getIndentLength(markerLine!);
    const componentIndent = getIndentLength(componentLine!);

    console.log(`App indent: ${appIndent} (expected 0)`);
    console.log(
      `Marker indent: ${markerIndent} (expected 0 - markers are siblings)`
    );
    console.log(
      `Component indent: ${componentIndent} (expected 2 - child of marker)`
    );

    // CORRECTED EXPECTATIONS per design:
    // - Markers after components are siblings (visual depth same as component)
    // - Components after markers are children (visual depth = marker + 1)

    expect(appIndent).toBe(0); // App at visual depth 0
    expect(markerIndent).toBe(0); // Marker at visual depth 0 (sibling to App)
    expect(componentIndent).toBe(2); // Component at visual depth 1 (child of marker = 0 + 1)
    expect(componentIndent).not.toBe(12); // NOT original depth 6 * 2
  });

  it("should show visual depths correctly with showLevelDetails enabled", () => {
    traceOptions.showLevelDetails = true;

    const nodes: readonly TreeNode[] = [
      createMarkerNode(0, 3),
      createRenderingNode(6, "DeepComponent"),
    ];

    const logs = captureConsoleLogs(() => {return renderTree(nodes)});
    const fullOutput = logs.filter((line) => {return line.trim().length > 0}).join("\n");

    console.log("\n=== WITH LEVEL DETAILS ===");
    console.log(fullOutput);
    console.log("===================\n");

    // Marker should show original depth info
    expect(fullOutput).toContain("Level: 6"); // Next node's depth
    expect(fullOutput).toContain("Filtered nodes: 3");

    // Component should still use visual depth for indentation
    const componentLine = logs.find((line) =>
      {return line.includes("[DeepComponent]")}
    );
    expect(componentLine).toBeDefined();

    const indent = getIndentLength(componentLine!);
    expect(indent).toBe(2); // Still visual depth 1, not original depth 6
  });
});
