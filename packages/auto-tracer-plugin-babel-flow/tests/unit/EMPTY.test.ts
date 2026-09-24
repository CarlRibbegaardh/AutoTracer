import { describe, it, expect } from "vitest";
import type { PragmaResult } from "@autotracer/filter-utils";
import { EMPTY } from "../../src/EMPTY";

describe("EMPTY", () => {
  it("has hasTrace set to false", () => {
    expect(EMPTY.hasTrace).toBe(false);
  });

  it("has hasDisable set to false", () => {
    expect(EMPTY.hasDisable).toBe(false);
  });

  it("satisfies the PragmaResult shape", () => {
    const check: PragmaResult = EMPTY;
    expect(check).toEqual({ hasTrace: false, hasDisable: false });
  });
});
