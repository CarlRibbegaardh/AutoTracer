import { describe, expect, it } from "vitest";
import { getForceStopTransition } from "../../../src/state/getForceStopTransition";

describe("getForceStopTransition", () => {
  it("[NET-STOP-008] immediately stops running and draining sessions", () => {
    expect(getForceStopTransition("running")).toBe("stopped");
    expect(getForceStopTransition("stopping")).toBe("stopped");
  });

  it("[NET-STATE-010] leaves a stopped session unchanged", () => {
    expect(getForceStopTransition("stopped")).toBe("stopped");
  });
});
