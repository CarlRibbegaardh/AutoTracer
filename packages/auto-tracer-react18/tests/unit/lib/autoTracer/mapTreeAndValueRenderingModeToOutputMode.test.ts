import { describe, expect, it } from "vitest";
import { mapTreeAndValueRenderingModeToOutputMode } from "../../../../src/lib/autoTracer/mapTreeAndValueRenderingModeToOutputMode";

describe("mapTreeAndValueRenderingModeToOutputMode", () => {
  it("maps group + as-is to devtools", () => {
    expect(mapTreeAndValueRenderingModeToOutputMode("group", "as-is")).toBe(
      "devtools"
    );
  });

  it("maps lineart + serialized to copy-paste", () => {
    expect(
      mapTreeAndValueRenderingModeToOutputMode("lineart", "serialized")
    ).toBe("copy-paste");
  });

  it("maps group + serialized to copy-paste", () => {
    expect(
      mapTreeAndValueRenderingModeToOutputMode("group", "serialized")
    ).toBe("copy-paste");
  });

  it("maps lineart + as-is to copy-paste", () => {
    expect(mapTreeAndValueRenderingModeToOutputMode("lineart", "as-is")).toBe(
      "copy-paste"
    );
  });
});
