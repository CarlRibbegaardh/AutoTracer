import { describe, expect, it } from "vitest";
import { getXhrTerminalOutcome } from "../../../src/outcomes/getXhrTerminalOutcome";

describe("getXhrTerminalOutcome", () => {
  it("[NET-OUTCOME-002] maps an XHR error to FAILED", () => {
    expect(getXhrTerminalOutcome("error")).toBe("FAILED");
  });

  it("[NET-OUTCOME-003] maps an XHR abort to ABORTED", () => {
    expect(getXhrTerminalOutcome("abort")).toBe("ABORTED");
  });

  it("[NET-OUTCOME-004] maps an XHR timeout to TIMED OUT", () => {
    expect(getXhrTerminalOutcome("timeout")).toBe("TIMED OUT");
  });
});
