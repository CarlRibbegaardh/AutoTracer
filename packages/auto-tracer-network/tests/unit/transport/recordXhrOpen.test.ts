import { describe, expect, it, vi } from "vitest";
import { createTerminalOutcomeGate } from "../../../src/outcomes/createTerminalOutcomeGate";
import { createXhrOpenMetadata } from "../../../src/transport/createXhrOpenMetadata";
import { recordXhrOpen } from "../../../src/transport/recordXhrOpen";

describe("recordXhrOpen", () => {
  it("[NET-XHR-002] stores normalized metadata when no request is active", () => {
    const setOpenMetadata = vi.fn();

    recordXhrOpen(
      { method: "post", requestedUrl: "/api/orders" },
      {
        getActiveRequest: () => undefined,
        clearActiveRequest: vi.fn(),
        setOpenMetadata,
      },
      {
        getCompletionMarker: vi.fn(),
        emit: vi.fn(),
      },
    );

    expect(setOpenMetadata).toHaveBeenCalledExactlyOnceWith(
      createXhrOpenMetadata({
        method: "post",
        requestedUrl: "/api/orders",
      }),
    );
  });

  it("[NET-XHR-002..004] finalizes and clears an active request before storing later open metadata", () => {
    const order: string[] = [];
    const setOpenMetadata = vi.fn(() => {
      order.push("metadata");
    });

    recordXhrOpen(
      { method: "DELETE", requestedUrl: "/api/second", async: false },
      {
        getActiveRequest: () => ({
          requestId: 33,
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
        }),
        clearActiveRequest: () => {
          order.push("clear");
        },
        setOpenMetadata,
      },
      {
        getCompletionMarker: () => 175,
        emit: () => {
          order.push("emit");
        },
      },
    );

    expect(order).toEqual([
      "remove",
      "emit",
      "settle",
      "clear",
      "metadata",
    ]);
    expect(setOpenMetadata).toHaveBeenCalledExactlyOnceWith(
      createXhrOpenMetadata({
        method: "DELETE",
        requestedUrl: "/api/second",
        async: false,
      }),
    );
  });
});
