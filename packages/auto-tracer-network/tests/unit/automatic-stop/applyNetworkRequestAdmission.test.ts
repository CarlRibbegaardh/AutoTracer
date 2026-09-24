import { describe, expect, it, vi } from "vitest";
import { applyNetworkRequestAdmission } from "../../../src/automatic-stop/applyNetworkRequestAdmission";

describe("applyNetworkRequestAdmission", () => {
  it("[NET-ID-007][NET-AUTOSTOP-002] persists the count for an admitted request", () => {
    const setAdmittedRequestCount = vi.fn();
    const enterStopping = vi.fn();

    applyNetworkRequestAdmission(
      {
        admitted: true,
        admittedRequestCount: 2,
        automaticStopTriggered: false,
      },
      setAdmittedRequestCount,
      enterStopping,
    );

    expect(setAdmittedRequestCount).toHaveBeenCalledExactlyOnceWith(2);
    expect(enterStopping).not.toHaveBeenCalled();
  });

  it("[NET-AUTOSTOP-004] persists the final admission before entering stopping", () => {
    const order: string[] = [];
    const enterStopping = vi.fn((requestLimit: number) => {
      order.push(`stopping:${requestLimit}`);
    });

    applyNetworkRequestAdmission(
      {
        admitted: true,
        admittedRequestCount: 3,
        automaticStopTriggered: true,
      },
      () => order.push("count"),
      enterStopping,
    );

    expect(order).toEqual(["count", "stopping:3"]);
    expect(enterStopping).toHaveBeenCalledExactlyOnceWith(3);
  });

  it("[NET-FILTER-008..009][NET-AUTOSTOP-003] performs no writes for a non-admitted request", () => {
    const setAdmittedRequestCount = vi.fn();
    const enterStopping = vi.fn();

    applyNetworkRequestAdmission(
      {
        admitted: false,
        admittedRequestCount: 3,
        automaticStopTriggered: false,
      },
      setAdmittedRequestCount,
      enterStopping,
    );

    expect(setAdmittedRequestCount).not.toHaveBeenCalled();
    expect(enterStopping).not.toHaveBeenCalled();
  });
});
