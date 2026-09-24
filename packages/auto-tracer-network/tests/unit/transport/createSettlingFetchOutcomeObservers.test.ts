import { describe, expect, it, vi } from "vitest";
import { createSettlingFetchOutcomeObservers } from "../../../src/transport/createSettlingFetchOutcomeObservers";

describe("createSettlingFetchOutcomeObservers", () => {
  it("[NET-EVENT-004][NET-ID-008][NET-STOP-005] emits a response before settling request work", () => {
    const order: string[] = [];
    const observers = createSettlingFetchOutcomeObservers({
      requestId: 12,
      method: "GET",
      requestedUrl: "/api/orders",
      startMarker: 100,
      getCompletionMarker: () => {
        return 184;
      },
      emit: () => {
        order.push("emit");
      },
      startResponseDetails: () => {
        order.push("details");
      },
      canEmitPendingOutput: () => {
        return true;
      },
      settlePendingWork: () => {
        order.push("settle");
      },
    });

    observers.onResolved(new Response("ok"));

    expect(order).toEqual(["emit", "details", "settle"]);
  });

  it("[NET-EVENT-004,012][NET-ID-008][NET-STOP-005] shares one rejection path that settles after all failure output", () => {
    const order: string[] = [];
    const observers = createSettlingFetchOutcomeObservers({
      requestId: 13,
      method: "POST",
      requestedUrl: "/api/orders",
      startMarker: 20,
      getCompletionMarker: () => {
        return 45;
      },
      emit: () => {
        order.push("emit");
      },
      startResponseDetails: () => {
        order.push("details");
      },
      canEmitPendingOutput: () => {
        return true;
      },
      settlePendingWork: () => {
        order.push("settle");
      },
    });

    expect(observers.onRejected).toBe(observers.onSynchronousFailure);

    observers.onRejected(new TypeError("fetch failed"));

    expect(order).toEqual(["emit", "emit", "settle"]);
  });

  it("[NET-NATIVE-005][NET-STOP-005] settles request work when event emission fails", () => {
    const failure = new Error("emit failed");
    const settlePendingWork = vi.fn();
    const observers = createSettlingFetchOutcomeObservers({
      requestId: 14,
      method: "GET",
      requestedUrl: "/api/orders",
      startMarker: 30,
      getCompletionMarker: () => {
        return 32;
      },
      emit: () => {
        throw failure;
      },
      startResponseDetails: vi.fn(),
      canEmitPendingOutput: () => {
        return true;
      },
      settlePendingWork,
    });

    expect(() => {
      observers.onResolved(new Response("ok"));
    }).toThrow(failure);
    expect(settlePendingWork).toHaveBeenCalledOnce();
  });

  it("[NET-STOP-003,010] suppresses stopped output while settling request work", () => {
    const emit = vi.fn();
    const startResponseDetails = vi.fn();
    const settlePendingWork = vi.fn();
    const observers = createSettlingFetchOutcomeObservers({
      requestId: 15,
      method: "GET",
      requestedUrl: "/api/orders",
      startMarker: 30,
      getCompletionMarker: () => {
        return 32;
      },
      emit,
      startResponseDetails,
      canEmitPendingOutput: () => {
        return false;
      },
      settlePendingWork,
    });

    observers.onResolved(new Response("ok"));

    expect(emit).not.toHaveBeenCalled();
    expect(startResponseDetails).not.toHaveBeenCalled();
    expect(settlePendingWork).toHaveBeenCalledOnce();
  });
});
