import { describe, expect, it, vi } from "vitest";

import * as groupDepthModule from "../../../../../src/lib/functions/state/groupDepth";
import * as groupModeModule from "../../../../../src/lib/functions/state/groupMode";
import { getTextModeIndent } from "../../../../../src/lib/functions/helpers/formatting/getTextModeIndent";

describe("getTextModeIndent", () => {
  it("should return empty string in default group mode", () => {
    vi.spyOn(groupModeModule, "getGroupModeInternal").mockReturnValue("default");
    vi.spyOn(groupDepthModule, "getDepth").mockReturnValue(3);

    const result = getTextModeIndent();

    expect(result).toBe("");
  });

  it("should return group indent in text group mode", () => {
    vi.spyOn(groupModeModule, "getGroupModeInternal").mockReturnValue("text");
    vi.spyOn(groupDepthModule, "getDepth").mockReturnValue(2);

    const result = getTextModeIndent();

    expect(result).toBe("│  │  ");
  });
});
