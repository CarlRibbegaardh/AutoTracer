import { describe, expect, it } from "vitest";
import { getStartTransition } from "../../../src/state/getStartTransition";

describe("getStartTransition", () => {
  it("[NET-STATE-006] starts a stopped session", () => {
    expect(getStartTransition("stopped")).toBe("running");
  });

  it("[NET-STATE-007] leaves a running session unchanged", () => {
    expect(getStartTransition("running")).toBe("running");
  });

  it("[NET-STATE-011] resumes a stopping session", () => {
    expect(getStartTransition("stopping")).toBe("running");
  });
});
