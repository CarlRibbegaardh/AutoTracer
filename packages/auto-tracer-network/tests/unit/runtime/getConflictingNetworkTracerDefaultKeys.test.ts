import { describe, expect, it } from "vitest";
import { getConflictingNetworkTracerDefaultKeys } from "../../../src/runtime/getConflictingNetworkTracerDefaultKeys";

describe("getConflictingNetworkTracerDefaultKeys", () => {
  it("[NET-INSTALL-005..007] reports only semantically changed resolved defaults", () => {
    expect(
      getConflictingNetworkTracerDefaultKeys(
        {
          enabledOnLoad: false,
          captureRequestHeaders: true,
          includePatterns: ["/first/**"],
        },
        {
          captureRequestHeaders: false,
          includePatterns: ["/later/**"],
        },
      ),
    ).toEqual(["captureRequestHeaders", "includePatterns"]);

    expect(
      getConflictingNetworkTracerDefaultKeys({}, { enabledOnLoad: false }),
    ).toEqual([]);
  });
});
