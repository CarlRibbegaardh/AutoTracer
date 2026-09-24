import { describe, expect, it } from "vitest";
import { mapTreeRenderingModeToFlowGroupMode } from "../../../../src/lib/treeRenderingMode/mapTreeRenderingModeToFlowGroupMode";

describe("mapTreeRenderingModeToFlowGroupMode", () => {
  it("maps group to default", () => {
    expect(mapTreeRenderingModeToFlowGroupMode("group")).toBe("default");
  });

  it("maps lineart to text", () => {
    expect(mapTreeRenderingModeToFlowGroupMode("lineart")).toBe("text");
  });
});
