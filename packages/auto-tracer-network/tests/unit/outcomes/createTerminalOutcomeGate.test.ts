import { describe, expect, it } from "vitest";
import { createTerminalOutcomeGate } from "../../../src/outcomes/createTerminalOutcomeGate";

describe("createTerminalOutcomeGate", () => {
  it("[NET-NATIVE-006] permits exactly one terminal outcome", () => {
    const claimTerminalOutcome = createTerminalOutcomeGate();

    expect(claimTerminalOutcome()).toBe(true);
    expect(claimTerminalOutcome()).toBe(false);
    expect(claimTerminalOutcome()).toBe(false);
  });

  it("[NET-XHR-004] suppresses a native terminal event after replacement", () => {
    const claimTerminalOutcome = createTerminalOutcomeGate();

    const replacementClaimed = claimTerminalOutcome();
    const nativeEventClaimed = claimTerminalOutcome();

    expect(replacementClaimed).toBe(true);
    expect(nativeEventClaimed).toBe(false);
  });
});
