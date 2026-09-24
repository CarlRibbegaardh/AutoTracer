import { describe, expect, it } from "vitest";
import { cloneStructuredSnapshot } from "../../../src/output/cloneStructuredSnapshot";

describe("cloneStructuredSnapshot", () => {
  it("[NET-OUTPUT-003] preserves structured detail values", () => {
    const input = {
      status: 201,
      profile: { displayName: "Ada" },
      tags: ["network", "trace"],
    };

    expect(cloneStructuredSnapshot(input)).toEqual(input);
  });

  it("[NET-OUTPUT-005] does not retain live mutable object references", () => {
    const input = { profile: { displayName: "Ada" } };

    const snapshot = cloneStructuredSnapshot(input);
    input.profile.displayName = "Grace";

    expect(snapshot).toEqual({ profile: { displayName: "Ada" } });
    expect(snapshot).not.toBe(input);
  });
});
