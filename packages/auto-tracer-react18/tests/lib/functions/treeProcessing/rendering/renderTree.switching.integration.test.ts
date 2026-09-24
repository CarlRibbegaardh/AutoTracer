import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderTree } from "@src/lib/functions/treeProcessing/rendering/renderTree";
import { traceOptions } from "@src/lib/types/globalState";
import * as indentedRendererModule from "@src/lib/functions/treeProcessing/rendering/renderers/createIndentedRenderer";
import * as consoleGroupRendererModule from "@src/lib/functions/treeProcessing/rendering/renderers/createConsoleGroupRenderer";
import type { TreeNode } from "@src/lib/functions/treeProcessing/types/TreeNode";

describe("renderTree - Renderer Switching", () => {
  const mockIndentedRenderer = vi.fn();
  const mockConsoleGroupRenderer = vi.fn();

  beforeEach(() => {
    vi.spyOn(indentedRendererModule, "createIndentedRenderer").mockReturnValue(
      mockIndentedRenderer
    );
    vi.spyOn(
      consoleGroupRendererModule,
      "createConsoleGroupRenderer"
    ).mockReturnValue(mockConsoleGroupRenderer);

    mockIndentedRenderer.mockClear();
    mockConsoleGroupRenderer.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Reset default
    traceOptions.treeRenderingMode = "lineart";
  });

  const mockNodes: TreeNode[] = [];

  it("should use indented renderer by default", () => {
    // Ensure default
    traceOptions.treeRenderingMode = "lineart";

    renderTree(mockNodes);

    expect(indentedRendererModule.createIndentedRenderer).toHaveBeenCalled();
    expect(mockIndentedRenderer).toHaveBeenCalledWith(mockNodes);
    expect(
      consoleGroupRendererModule.createConsoleGroupRenderer
    ).not.toHaveBeenCalled();
  });

  it("should use console-group renderer when configured", () => {
    traceOptions.treeRenderingMode = "group";

    renderTree(mockNodes);

    expect(
      consoleGroupRendererModule.createConsoleGroupRenderer
    ).toHaveBeenCalled();
    expect(mockConsoleGroupRenderer).toHaveBeenCalledWith(mockNodes);
    expect(
      indentedRendererModule.createIndentedRenderer
    ).not.toHaveBeenCalled();
  });
});
