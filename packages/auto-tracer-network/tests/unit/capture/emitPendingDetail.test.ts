import { describe, expect, it, vi } from "vitest";
import { emitPendingDetail } from "../../../src/capture/emitPendingDetail";

describe("emitPendingDetail", () => {
  it("[NET-STOP-005] emits a settled detail while pending output is allowed", () => {
    const detail = { kind: "detail" };
    const emit = vi.fn();

    emitPendingDetail(detail, {
      canEmitPendingOutput: () => true,
      emit,
    });

    expect(emit).toHaveBeenCalledExactlyOnceWith(detail);
  });

  it("[NET-STOP-002,008,010] suppresses a settled detail after stopping", () => {
    const emit = vi.fn();

    emitPendingDetail(
      { kind: "detail" },
      {
        canEmitPendingOutput: () => false,
        emit,
      },
    );

    expect(emit).not.toHaveBeenCalled();
  });

  it("[NET-NATIVE-005] isolates detail output failure", () => {
    expect(() =>
      emitPendingDetail(
        { kind: "detail" },
        {
          canEmitPendingOutput: () => true,
          emit: () => {
            throw new Error("output failed");
          },
        },
      ),
    ).not.toThrow();
  });
});
