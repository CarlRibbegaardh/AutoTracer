import { describe, expect, it, vi } from "vitest";
import { startFetchRequestBodyCapture } from "../../../src/capture/startFetchRequestBodyCapture";

describe("startFetchRequestBodyCapture", () => {
  it("[NET-CAPTURE-009,011] captures RequestInit.body synchronously without cloning the input Request", async () => {
    const input = new Request("https://example.test/orders", {
      method: "POST",
      body: "input body",
    });
    input.clone = () => {
      throw new Error("must not clone");
    };
    const order: string[] = [];

    const completion = startFetchRequestBodyCapture(
      12,
      { input, init: { method: "POST", body: "override body" } },
      {
        contentType: "text/plain",
        bodyCaptureLimit: 64,
        redactionPatterns: [],
        beginPendingWork: () => {
          order.push("begin");
        },
        canEmitPendingOutput: () => true,
        emit: (event) => {
          order.push(`emit:${event.tokens[2]?.text}`);
        },
        settlePendingWork: () => {
          order.push("settle");
        },
      },
    );

    expect(order).toEqual(["begin", "emit:request body", "settle"]);
    await completion;
    expect(input.bodyUsed).toBe(false);
  });

  it("[NET-CAPTURE-010..011] starts cloned Request body capture without waiting", async () => {
    const input = new Request("https://example.test/orders", {
      method: "POST",
      body: "input body",
    });
    const emit = vi.fn();

    const completion = startFetchRequestBodyCapture(
      13,
      { input },
      {
        contentType: "text/plain",
        bodyCaptureLimit: 64,
        redactionPatterns: [],
        beginPendingWork: vi.fn(),
        canEmitPendingOutput: () => true,
        emit,
        settlePendingWork: vi.fn(),
      },
    );

    expect(input.bodyUsed).toBe(false);
    await completion;
    expect(emit).toHaveBeenCalledOnce();
    expect(input.bodyUsed).toBe(false);
  });

  it("[NET-ID-008] creates no pending work when the Fetch call has no body", async () => {
    const beginPendingWork = vi.fn();

    await startFetchRequestBodyCapture(
      14,
      { input: "/api/orders" },
      {
        contentType: null,
        bodyCaptureLimit: 64,
        redactionPatterns: [],
        beginPendingWork,
        canEmitPendingOutput: () => true,
        emit: vi.fn(),
        settlePendingWork: vi.fn(),
      },
    );

    expect(beginPendingWork).not.toHaveBeenCalled();
  });
});
