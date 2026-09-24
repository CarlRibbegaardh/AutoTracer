import { describe, expect, it, vi } from "vitest";
import { createTerminalOutcomeGate } from "../../../src/outcomes/createTerminalOutcomeGate";
import { createTimedFetchRejectionEvents } from "../../../src/transport/createTimedFetchRejectionEvents";
import { createXhrSynchronousFailureObserver } from "../../../src/transport/createXhrSynchronousFailureObserver";

describe("createXhrSynchronousFailureObserver", () => {
  it("[NET-EVENT-002,006,009,012][NET-XHR-004][NET-OUTCOME-002,008] removes listeners and emits one timed failure", () => {
    const order: string[] = [];
    const emitted: unknown[] = [];
    const failure = new DOMException("invalid state", "InvalidStateError");
    const observeFailure = createXhrSynchronousFailureObserver(
      {
        requestId: 34,
        method: "POST",
        requestedUrl: "/api/orders",
        startMarker: 100,
        claimTerminalOutcome: createTerminalOutcomeGate(),
        removeTerminalListeners: () => {
          order.push("remove");
        },
        settlePendingWork: () => {
          order.push("settle");
        },
      },
      () => 150,
      (event) => {
        order.push("emit");
        emitted.push(event);
      },
    );

    observeFailure(failure);
    observeFailure(failure);

    const expected = createTimedFetchRejectionEvents({
      requestId: 34,
      method: "POST",
      requestedUrl: "/api/orders",
      startMarker: 100,
      completionMarker: 150,
      failure,
    });
    expect(order).toEqual(["remove", "emit", "emit", "settle"]);
    expect(emitted).toEqual([expected.completion, expected.failureDetail]);
  });

  it("[NET-NATIVE-002,005] isolates synchronous-failure output errors and still settles", () => {
    const settlePendingWork = vi.fn();
    const observeFailure = createXhrSynchronousFailureObserver(
      {
        requestId: 35,
        method: "GET",
        requestedUrl: "/api/orders",
        startMarker: 100,
        claimTerminalOutcome: createTerminalOutcomeGate(),
        removeTerminalListeners: vi.fn(),
        settlePendingWork,
      },
      () => 125,
      () => {
        throw new Error("sink failed");
      },
    );

    expect(() => observeFailure(new TypeError("send failed"))).not.toThrow();
    expect(settlePendingWork).toHaveBeenCalledOnce();
  });
});
