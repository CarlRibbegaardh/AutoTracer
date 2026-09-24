import { describe, expect, it } from "vitest";
import { mapFlowGroupModeToTreeRenderingMode } from "../../../../src/lib/treeRenderingMode/mapFlowGroupModeToTreeRenderingMode";

describe("mapFlowGroupModeToTreeRenderingMode", () => {
  it("maps default to group", () => {
    expect(mapFlowGroupModeToTreeRenderingMode("default")).toBe("group");
  });

  it("maps text to lineart", () => {
    expect(mapFlowGroupModeToTreeRenderingMode("text")).toBe("lineart");
  });
});
