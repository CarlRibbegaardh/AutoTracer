import { describe, expect, it } from "vitest";
import { createAbortedCompletionEvent } from "../../../src/events/createAbortedCompletionEvent";
import { createTerminalOutcomeGate } from "../../../src/outcomes/createTerminalOutcomeGate";
import { replaceActiveXhrRequest } from "../../../src/transport/replaceActiveXhrRequest";

describe("replaceActiveXhrRequest", () => {
  it("[NET-XHR-003..004][NET-NATIVE-002] removes native listeners before finalizing the active request", () => {
    const order: string[] = [];
    const emitted: unknown[] = [];

    replaceActiveXhrRequest(
      {
        requestId: 32,
        method: "GET",
        requestedUrl: "/api/first",
        startMarker: 100,
        claimTerminalOutcome: createTerminalOutcomeGate(),
        settlePendingWork: () => {
          order.push("settle");
        },
        removeTerminalListeners: () => {
          order.push("remove");
        },
      },
      175,
      (event) => {
        order.push("emit");
        emitted.push(event);
      },
    );

    expect(order).toEqual(["remove", "emit", "settle"]);
    expect(emitted).toEqual([
      createAbortedCompletionEvent({
        requestId: 32,
        method: "GET",
        url: "/api/first",
        elapsedMilliseconds: 75,
      }),
    ]);
  });
});
