import { describe, expect, it, vi } from "vitest";
import { runPendingDetailCapture } from "../../../src/capture/runPendingDetailCapture";

describe("runPendingDetailCapture", () => {
  it("[NET-ID-008][NET-STOP-005] registers before capture and settles after output", () => {
    const order: string[] = [];

    runPendingDetailCapture(
      () => {
        order.push("capture");
        return "detail";
      },
      {
        beginPendingWork: () => {
          order.push("begin");
        },
        canEmitPendingOutput: () => true,
        emit: (detail) => {
          order.push(`emit:${detail}`);
        },
        settlePendingWork: () => {
          order.push("settle");
        },
      },
    );

    expect(order).toEqual(["begin", "capture", "emit:detail", "settle"]);
  });

  it("[NET-STOP-002,008,010] suppresses output after stopping and settles", () => {
    const emit = vi.fn();
    const settlePendingWork = vi.fn();

    runPendingDetailCapture(() => "detail", {
      beginPendingWork: vi.fn(),
      canEmitPendingOutput: () => false,
      emit,
      settlePendingWork,
    });

    expect(emit).not.toHaveBeenCalled();
    expect(settlePendingWork).toHaveBeenCalledOnce();
  });

  it("[NET-NATIVE-005] isolates capture and output failures while settling", () => {
    const captureSettlement = vi.fn();
    const outputSettlement = vi.fn();

    expect(() =>
      runPendingDetailCapture(
        () => {
          throw new Error("capture failed");
        },
        {
          beginPendingWork: vi.fn(),
          canEmitPendingOutput: () => true,
          emit: vi.fn(),
          settlePendingWork: captureSettlement,
        },
      ),
    ).not.toThrow();
    expect(captureSettlement).toHaveBeenCalledOnce();

    expect(() =>
      runPendingDetailCapture(() => "detail", {
        beginPendingWork: vi.fn(),
        canEmitPendingOutput: () => true,
        emit: () => {
          throw new Error("output failed");
        },
        settlePendingWork: outputSettlement,
      }),
    ).not.toThrow();
    expect(outputSettlement).toHaveBeenCalledOnce();
  });
});
