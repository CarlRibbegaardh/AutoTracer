import { describe, expect, it } from "vitest";
import { isHttpErrorStatus } from "../../../src/outcomes/isHttpErrorStatus";

describe("isHttpErrorStatus", () => {
  it("[NET-OUTCOME-006] identifies every 4xx boundary as an HTTP error status", () => {
    expect(isHttpErrorStatus(400)).toBe(true);
    expect(isHttpErrorStatus(499)).toBe(true);
  });

  it("[NET-OUTCOME-006] identifies every 5xx boundary as an HTTP error status", () => {
    expect(isHttpErrorStatus(500)).toBe(true);
    expect(isHttpErrorStatus(599)).toBe(true);
  });

  it("[NET-OUTCOME-006] excludes statuses outside the 4xx and 5xx ranges", () => {
    expect(isHttpErrorStatus(399)).toBe(false);
    expect(isHttpErrorStatus(600)).toBe(false);
  });
});
