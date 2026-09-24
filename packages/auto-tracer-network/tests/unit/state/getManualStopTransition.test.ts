import { describe, expect, it } from "vitest";
import { getManualStopTransition } from "../../../src/state/getManualStopTransition";

describe("getManualStopTransition", () => {
  it("[NET-STOP-002] immediately stops when waiting is disabled", () => {
    expect(getManualStopTransition("running", false)).toBe("stopped");
  });

  it("[NET-STOP-004] begins draining when waiting is enabled", () => {
    expect(getManualStopTransition("running", true)).toBe("stopping");
  });

  it("[NET-STATE-008][NET-STATE-009] leaves stopped or stopping sessions unchanged", () => {
    expect(getManualStopTransition("stopped", true)).toBe("stopped");
    expect(getManualStopTransition("stopping", false)).toBe("stopping");
  });
});
