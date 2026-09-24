import { describe, expect, it } from "vitest";
import { shouldFinalizeDrain } from "../../../src/state/shouldFinalizeDrain";

describe("shouldFinalizeDrain", () => {
  it("[NET-STOP-006] finalizes a drain when no logging work remains", () => {
    expect(shouldFinalizeDrain("stopping", 0)).toBe(true);
  });

  it("[NET-STOP-006] retains a drain while logging work remains", () => {
    expect(shouldFinalizeDrain("stopping", 1)).toBe(false);
  });

  it("[NET-STOP-006] does not finalize outside the stopping state", () => {
    expect(shouldFinalizeDrain("running", 0)).toBe(false);
    expect(shouldFinalizeDrain("stopped", 0)).toBe(false);
  });
});
