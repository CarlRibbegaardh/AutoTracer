import { describe, it, expect } from "vitest";
import { merge } from "../../src/merge";

describe("merge", () => {
  it("returns all-false when both inputs are all-false", () => {
    expect(
      merge(
        { hasTrace: false, hasDisable: false },
        { hasTrace: false, hasDisable: false },
      ),
    ).toEqual({ hasTrace: false, hasDisable: false });
  });

  it("returns hasTrace=true when first input has hasTrace", () => {
    expect(
      merge(
        { hasTrace: true, hasDisable: false },
        { hasTrace: false, hasDisable: false },
      ),
    ).toEqual({ hasTrace: true, hasDisable: false });
  });

  it("returns hasTrace=true when second input has hasTrace", () => {
    expect(
      merge(
        { hasTrace: false, hasDisable: false },
        { hasTrace: true, hasDisable: false },
      ),
    ).toEqual({ hasTrace: true, hasDisable: false });
  });

  it("returns hasDisable=true when first input has hasDisable", () => {
    expect(
      merge(
        { hasTrace: false, hasDisable: true },
        { hasTrace: false, hasDisable: false },
      ),
    ).toEqual({ hasTrace: false, hasDisable: true });
  });

  it("returns hasDisable=true when second input has hasDisable", () => {
    expect(
      merge(
        { hasTrace: false, hasDisable: false },
        { hasTrace: false, hasDisable: true },
      ),
    ).toEqual({ hasTrace: false, hasDisable: true });
  });

  it("sets each flag independently when they come from different inputs", () => {
    expect(
      merge(
        { hasTrace: true, hasDisable: false },
        { hasTrace: false, hasDisable: true },
      ),
    ).toEqual({ hasTrace: true, hasDisable: true });
  });
});
