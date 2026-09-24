import { describe, expect, it } from "vitest";
import { mapOutputModeToTreeRenderingMode } from "../../../../src/lib/autoTracer/mapOutputModeToTreeRenderingMode";

describe("mapOutputModeToTreeRenderingMode", () => {
  it("maps devtools to group", () => {
    expect(mapOutputModeToTreeRenderingMode("devtools")).toBe("group");
  });

  it("maps copy-paste to lineart", () => {
    expect(mapOutputModeToTreeRenderingMode("copy-paste")).toBe("lineart");
  });
});
