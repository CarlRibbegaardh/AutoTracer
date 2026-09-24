import { afterEach, describe, expect, it, vi } from "vitest";
import type { TreeNode } from "@src/lib/functions/treeProcessing/types/TreeNode";
import { renderIndentedNode } from "@src/lib/functions/treeProcessing/rendering/renderIndentedNode";
import { getReactRuntimeFilteringState } from "@src/lib/runtimeFiltering/getReactRuntimeFilteringState";

describe("renderIndentedNode", () => {
  const runtimeFiltering = getReactRuntimeFilteringState();

  afterEach(() => {
    runtimeFiltering.filterMode(false);
  });

  it("appends a styled copy/paste filter snippet line when filterMode is enabled", () => {
    runtimeFiltering.filterMode(true);

    const node: TreeNode = {
      depth: 0,
      componentName: "Example",
      displayName: "Example",
      renderType: "Rendering",
      flags: 0,
      stateChanges: [],
      propChanges: [],
      componentLogs: [],
      isTracked: false,
      trackingGUID: null,
      hasIdenticalValueWarning: false,
    };

    const logSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => {
        return undefined;
      });

    renderIndentedNode(node, 0, 0, false);

    const expectedSnippet =
      '│   %cautoTracer.reactTracer.addFilter("Example")';
    const expectedStyle = "font-size: 0.85em; font-weight: 400;";

    expect(
      logSpy.mock.calls.some((call) => {
        return call[0] === expectedSnippet && call[1] === expectedStyle;
      })
    ).toBe(true);

    logSpy.mockRestore();
  });

  it("does not append a styled copy/paste filter snippet line when filterMode is disabled", () => {
    runtimeFiltering.filterMode(false);

    const node: TreeNode = {
      depth: 0,
      componentName: "Example",
      displayName: "Example",
      renderType: "Rendering",
      flags: 0,
      stateChanges: [],
      propChanges: [],
      componentLogs: [],
      isTracked: false,
      trackingGUID: null,
      hasIdenticalValueWarning: false,
    };

    const logSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => {
        return undefined;
      });

    renderIndentedNode(node, 0, 0, false);

    const expectedSnippet =
      '│   %cautoTracer.reactTracer.addFilter("Example")';
    const expectedStyle = "font-size: 0.85em; font-weight: 400;";

    expect(
      logSpy.mock.calls.some((call) => {
        return call[0] === expectedSnippet && call[1] === expectedStyle;
      })
    ).toBe(false);

    logSpy.mockRestore();
  });
});
