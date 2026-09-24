import { describe, expect, it, vi } from "vitest";
import { createTerminalOutcomeGate } from "../../../src/outcomes/createTerminalOutcomeGate";
import { createXhrTerminalObservers } from "../../../src/transport/createXhrTerminalObservers";

describe("createXhrTerminalObservers", () => {
  it("[NET-EVENT-002,005][NET-XHR-004][NET-NATIVE-006] composes four observers around one shared terminal gate", () => {
    const emit = vi.fn();
    const settlePendingWork = vi.fn();
    const observers = createXhrTerminalObservers(
      { status: 0, responseURL: "" },
      {
        requestId: 29,
        method: "GET",
        requestedUrl: "/api/orders",
        normalizedRequestedUrl: "https://example.test/api/orders",
        startMarker: 100,
        getCompletionMarker: () => 125,
        claimTerminalOutcome: createTerminalOutcomeGate(),
        canEmitPendingOutput: () => true,
        emit,
        settlePendingWork,
      },
    );

    expect(Object.keys(observers)).toEqual([
      "load",
      "error",
      "abort",
      "timeout",
    ]);

    observers.timeout();
    observers.load();
    observers.error();
    observers.abort();

    expect(emit).toHaveBeenCalledOnce();
    expect(settlePendingWork).toHaveBeenCalledOnce();
  });
});
