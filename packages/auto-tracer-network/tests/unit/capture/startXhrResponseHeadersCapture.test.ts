import { describe, expect, it, vi } from "vitest";
import { createXhrResponseHeadersDetailEvent } from "../../../src/capture/createXhrResponseHeadersDetailEvent";
import { createXhrResponseHeadersSnapshot } from "../../../src/capture/createXhrResponseHeadersSnapshot";
import { startXhrResponseHeadersCapture } from "../../../src/capture/startXhrResponseHeadersCapture";

describe("startXhrResponseHeadersCapture", () => {
  it("[NET-CAPTURE-005,008][NET-ID-008] captures exposed XHR headers as independent pending work", () => {
    const rawHeaders =
      "Content-Type: application/json\r\nX-Session-Token: secret\r\n";
    const getAllResponseHeaders = vi.fn(() => rawHeaders);
    const beginPendingWork = vi.fn();
    const emit = vi.fn();
    const settlePendingWork = vi.fn();

    startXhrResponseHeadersCapture(
      31,
      { getAllResponseHeaders },
      {
        redactionPatterns: ["*token*"],
        beginPendingWork,
        canEmitPendingOutput: () => true,
        emit,
        settlePendingWork,
      },
    );

    expect(getAllResponseHeaders).toHaveBeenCalledOnce();
    expect(beginPendingWork).toHaveBeenCalledOnce();
    expect(emit).toHaveBeenCalledExactlyOnceWith(
      createXhrResponseHeadersDetailEvent(
        31,
        createXhrResponseHeadersSnapshot(rawHeaders),
        ["*token*"],
      ),
    );
    expect(settlePendingWork).toHaveBeenCalledOnce();
  });
});
