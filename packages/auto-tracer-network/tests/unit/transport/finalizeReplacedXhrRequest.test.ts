import { describe, expect, it, vi } from "vitest";
import { createAbortedCompletionEvent } from "../../../src/events/createAbortedCompletionEvent";
import { createTerminalOutcomeGate } from "../../../src/outcomes/createTerminalOutcomeGate";
import { finalizeReplacedXhrRequest } from "../../../src/transport/finalizeReplacedXhrRequest";

describe("finalizeReplacedXhrRequest", () => {
  it("[NET-XHR-003..004][NET-OUTCOME-003][NET-NATIVE-006] emits and settles one replacement abort", () => {
    const emitted: unknown[] = [];
    const settlePendingWork = vi.fn();
    const request = {
      requestId: 24,
      method: "GET",
      requestedUrl: "/api/first",
      startMarker: 100,
      claimTerminalOutcome: createTerminalOutcomeGate(),
      settlePendingWork,
    } as const;

    finalizeReplacedXhrRequest(request, 175, (event) => {
      emitted.push(event);
    });
    finalizeReplacedXhrRequest(request, 200, (event) => {
      emitted.push(event);
    });

    expect(emitted).toEqual([
      createAbortedCompletionEvent({
        requestId: 24,
        method: "GET",
        url: "/api/first",
        elapsedMilliseconds: 75,
      }),
    ]);
    expect(settlePendingWork).toHaveBeenCalledOnce();
  });

  it("[NET-XHR-003][NET-NATIVE-002,005] isolates replacement output failure and still settles", () => {
    const settlePendingWork = vi.fn();

    expect(() =>
      finalizeReplacedXhrRequest(
        {
          requestId: 25,
          method: "POST",
          requestedUrl: "/api/orders",
          startMarker: 100,
          claimTerminalOutcome: createTerminalOutcomeGate(),
          settlePendingWork,
        },
        125,
        () => {
          throw new Error("sink failed");
        },
      ),
    ).not.toThrow();
    expect(settlePendingWork).toHaveBeenCalledOnce();
  });
});
