import { describe, expect, it } from "vitest";
import { mapOutputModeToValueRenderingMode } from "../../../../src/lib/autoTracer/mapOutputModeToValueRenderingMode";

describe("mapOutputModeToValueRenderingMode", () => {
  it("maps devtools to as-is", () => {
    expect(mapOutputModeToValueRenderingMode("devtools")).toBe("as-is");
  });

  it("maps copy-paste to serialized", () => {
    expect(mapOutputModeToValueRenderingMode("copy-paste")).toBe("serialized");
  });
});
