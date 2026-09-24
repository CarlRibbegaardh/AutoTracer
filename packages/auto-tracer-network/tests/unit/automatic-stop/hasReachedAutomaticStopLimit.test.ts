import { describe, expect, it } from "vitest";
import { hasReachedAutomaticStopLimit } from "../../../src/automatic-stop/hasReachedAutomaticStopLimit";

describe("hasReachedAutomaticStopLimit", () => {
  it("[NET-AUTOSTOP-004] remains false while automatic stop is disabled", () => {
    expect(hasReachedAutomaticStopLimit(100, undefined)).toBe(false);
  });

  it("[NET-AUTOSTOP-004] remains false before the final admission", () => {
    expect(hasReachedAutomaticStopLimit(2, 3)).toBe(false);
  });

  it("[NET-AUTOSTOP-004] becomes true on the final admitted request", () => {
    expect(hasReachedAutomaticStopLimit(3, 3)).toBe(true);
  });
});
