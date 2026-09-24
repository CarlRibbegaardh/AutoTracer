import { describe, expect, it, vi } from "vitest";
import { createHttpCompletionEvent } from "../../../src/events/createHttpCompletionEvent";
import { createTerminalOutcomeGate } from "../../../src/outcomes/createTerminalOutcomeGate";
import { createXhrTerminalObserver } from "../../../src/transport/createXhrTerminalObserver";

describe("createXhrTerminalObserver", () => {
  it("[NET-EVENT-002,005..007][NET-ID-008][NET-NATIVE-006] emits and settles the first native terminal event", () => {
    const order: string[] = [];
    const emit = vi.fn(() => {
      order.push("emit");
    });
    const startResponseDetails = vi.fn(() => {
      order.push("details");
    });
    const settlePendingWork = vi.fn(() => {
      order.push("settle");
    });
    const getCompletionMarker = vi.fn(() => 175);
    const observeLoad = createXhrTerminalObserver(
      "load",
      {
        status: 201,
        responseURL: "https://example.test/api/orders",
      },
      {
        requestId: 26,
        method: "POST",
        requestedUrl: "/api/orders",
        normalizedRequestedUrl: "https://example.test/api/orders",
        startMarker: 100,
        getCompletionMarker,
        claimTerminalOutcome: createTerminalOutcomeGate(),
        canEmitPendingOutput: () => true,
        emit,
        startResponseDetails,
        settlePendingWork,
      },
    );

    observeLoad();
    observeLoad();

    expect(emit).toHaveBeenCalledExactlyOnceWith(
      createHttpCompletionEvent({
        requestId: 26,
        status: 201,
        method: "POST",
        url: "/api/orders",
        elapsedMilliseconds: 75,
      }),
    );
    expect(getCompletionMarker).toHaveBeenCalledOnce();
    expect(startResponseDetails).toHaveBeenCalledOnce();
    expect(settlePendingWork).toHaveBeenCalledOnce();
    expect(order).toEqual(["emit", "details", "settle"]);
  });

  it("[NET-EVENT-002,005][NET-XHR-004][NET-NATIVE-005..006] shares a gate across competing native events", () => {
    const claimTerminalOutcome = createTerminalOutcomeGate();
    const emit = vi.fn();
    const settlePendingWork = vi.fn();
    const input = {
      requestId: 27,
      method: "GET",
      requestedUrl: "/api/orders",
      normalizedRequestedUrl: "https://example.test/api/orders",
      startMarker: 100,
      getCompletionMarker: () => 125,
      claimTerminalOutcome,
      canEmitPendingOutput: () => true,
      emit,
      settlePendingWork,
    } as const;
    const xhr = { status: 0, responseURL: "" } as const;

    createXhrTerminalObserver("error", xhr, input)();
    createXhrTerminalObserver("abort", xhr, input)();

    expect(emit).toHaveBeenCalledOnce();
    expect(settlePendingWork).toHaveBeenCalledOnce();
  });

  it("[NET-CAPTURE-001][NET-OUTCOME-002..004] does not start response details for failed XHR outcomes", () => {
    const startResponseDetails = vi.fn();
    const input = {
      requestId: 29,
      method: "GET",
      requestedUrl: "/api/orders",
      normalizedRequestedUrl: "https://example.test/api/orders",
      startMarker: 100,
      getCompletionMarker: () => 125,
      canEmitPendingOutput: () => true,
      emit: vi.fn(),
      startResponseDetails,
      settlePendingWork: vi.fn(),
    };

    createXhrTerminalObserver("error", { status: 0, responseURL: "" }, {
      ...input,
      claimTerminalOutcome: createTerminalOutcomeGate(),
    })();
    createXhrTerminalObserver("abort", { status: 0, responseURL: "" }, {
      ...input,
      claimTerminalOutcome: createTerminalOutcomeGate(),
    })();
    createXhrTerminalObserver("timeout", { status: 0, responseURL: "" }, {
      ...input,
      claimTerminalOutcome: createTerminalOutcomeGate(),
    })();

    expect(startResponseDetails).not.toHaveBeenCalled();
  });

  it("[NET-NATIVE-002,005] isolates terminal output failure and still settles", () => {
    const settlePendingWork = vi.fn();
    const observeTimeout = createXhrTerminalObserver(
      "timeout",
      { status: 0, responseURL: "" },
      {
        requestId: 28,
        method: "GET",
        requestedUrl: "/api/slow",
        normalizedRequestedUrl: "https://example.test/api/slow",
        startMarker: 100,
        getCompletionMarker: () => 150,
        claimTerminalOutcome: createTerminalOutcomeGate(),
        canEmitPendingOutput: () => true,
        emit: () => {
          throw new Error("sink failed");
        },
        settlePendingWork,
      },
    );

    expect(observeTimeout).not.toThrow();
    expect(settlePendingWork).toHaveBeenCalledOnce();
  });

  it("[NET-STOP-002][NET-NATIVE-004] suppresses terminal output after immediate stop", () => {
    const getCompletionMarker = vi.fn();
    const emit = vi.fn();
    const startResponseDetails = vi.fn();
    const settlePendingWork = vi.fn();
    const observeLoad = createXhrTerminalObserver(
      "load",
      { status: 200, responseURL: "https://example.test/api/stopped" },
      {
        requestId: 30,
        method: "GET",
        requestedUrl: "/api/stopped",
        normalizedRequestedUrl: "https://example.test/api/stopped",
        startMarker: 100,
        getCompletionMarker,
        claimTerminalOutcome: createTerminalOutcomeGate(),
        canEmitPendingOutput: () => false,
        emit,
        startResponseDetails,
        settlePendingWork,
      },
    );

    observeLoad();
    observeLoad();

    expect(getCompletionMarker).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
    expect(startResponseDetails).not.toHaveBeenCalled();
    expect(settlePendingWork).toHaveBeenCalledOnce();
  });
});
