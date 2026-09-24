import { describe, expect, it, vi } from "vitest";
import { invokeXhrSendByAdmission } from "../../../src/transport/invokeXhrSendByAdmission";

describe("invokeXhrSendByAdmission", () => {
  it("[NET-ID-008][NET-FILTER-005..006][NET-AUTOSTOP-003][NET-NATIVE-002] delegates a non-admitted send without tracing work", () => {
    const body = new URLSearchParams({ title: "hidden" });
    const nativeSend = vi.fn();
    const addEventListener = vi.fn();

    invokeXhrSendByAdmission(
      nativeSend,
      {
        xhr: {
          status: 0,
          responseURL: "",
          addEventListener,
          removeEventListener: vi.fn(),
        },
        args: [body],
      },
      { admitted: false },
    );

    expect(nativeSend).toHaveBeenCalledExactlyOnceWith(body);
    expect(addEventListener).not.toHaveBeenCalled();
  });
});
