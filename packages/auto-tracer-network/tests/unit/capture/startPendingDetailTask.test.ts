import { describe, expect, it, vi } from "vitest";
import { startPendingDetailTask } from "../../../src/capture/startPendingDetailTask";

describe("startPendingDetailTask", () => {
  it("[NET-ID-008][NET-EVENT-010][NET-BODY-015] registers before capture and settles after output", async () => {
    const order: string[] = [];

    const completion = startPendingDetailTask(
      () => {
        order.push("capture");
        return Promise.resolve("detail");
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

    expect(order).toEqual(["begin", "capture"]);
    await completion;
    expect(order).toEqual(["begin", "capture", "emit:detail", "settle"]);
  });

  it("[NET-STOP-002,008,010][NET-BODY-015] settles without output after stopping", async () => {
    const emit = vi.fn();
    const settlePendingWork = vi.fn();

    await startPendingDetailTask(() => Promise.resolve("detail"), {
      beginPendingWork: vi.fn(),
      canEmitPendingOutput: () => false,
      emit,
      settlePendingWork,
    });

    expect(emit).not.toHaveBeenCalled();
    expect(settlePendingWork).toHaveBeenCalledOnce();
  });

  it("[NET-BODY-015][NET-NATIVE-005] settles and absorbs capture rejection", async () => {
    const failure = new Error("capture failed");
    const emit = vi.fn();
    const settlePendingWork = vi.fn();

    await expect(
      startPendingDetailTask(() => Promise.reject(failure), {
        beginPendingWork: vi.fn(),
        canEmitPendingOutput: () => true,
        emit,
        settlePendingWork,
      }),
    ).resolves.toBeUndefined();
    expect(emit).not.toHaveBeenCalled();
    expect(settlePendingWork).toHaveBeenCalledOnce();
  });

  it("[NET-BODY-015][NET-NATIVE-005] settles and absorbs synchronous capture failure", async () => {
    const settlePendingWork = vi.fn();

    await expect(
      startPendingDetailTask(
        () => {
          throw new Error("capture failed");
        },
        {
          beginPendingWork: vi.fn(),
          canEmitPendingOutput: () => true,
          emit: vi.fn(),
          settlePendingWork,
        },
      ),
    ).resolves.toBeUndefined();
    expect(settlePendingWork).toHaveBeenCalledOnce();
  });
});
