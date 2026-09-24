import { describe, expect, it } from "vitest";
import { canEmitPendingOutput } from "../../../src/state/canEmitPendingOutput";

describe("canEmitPendingOutput", () => {
  it("[NET-STOP-005] permits pending output while running or draining", () => {
    expect(canEmitPendingOutput("running")).toBe(true);
    expect(canEmitPendingOutput("stopping")).toBe(true);
  });

  it("[NET-STOP-002][NET-STOP-008][NET-STOP-010] suppresses pending output after stopping", () => {
    expect(canEmitPendingOutput("stopped")).toBe(false);
  });
});
