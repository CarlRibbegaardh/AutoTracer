import { describe, expect, it } from "vitest";
import { allocateNetworkRequestAdmission } from "../../../src/identity/allocateNetworkRequestAdmission";
import { createRequestIdStore } from "../../../src/identity/createRequestIdStore";

describe("allocateNetworkRequestAdmission", () => {
  it("[NET-ID-001,003,007][NET-FILTER-007..008] allocates identity before filtering without counting hidden requests", () => {
    const requestIds = createRequestIdStore();
    const filters = {
      includePatterns: ["https://example.test/api/**"],
      excludePatterns: ["https://example.test/api/private/**"],
    } as const;

    const hidden = allocateNetworkRequestAdmission(
      requestIds.getNextRequestId,
      "https://example.test/api/private/orders",
      {
        filters,
        admittedRequestCount: 0,
        autoStopLimit: 2,
      },
    );
    const visible = allocateNetworkRequestAdmission(
      requestIds.getNextRequestId,
      "https://example.test/api/orders",
      {
        filters,
        admittedRequestCount: hidden.admittedRequestCount,
        autoStopLimit: 2,
      },
    );

    expect(hidden).toEqual({
      requestId: 1,
      included: false,
      admitted: false,
      admittedRequestCount: 0,
      automaticStopTriggered: false,
    });
    expect(visible).toEqual({
      requestId: 2,
      included: true,
      admitted: true,
      admittedRequestCount: 1,
      automaticStopTriggered: false,
    });
  });
});
