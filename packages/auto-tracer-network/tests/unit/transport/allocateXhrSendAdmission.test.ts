import { describe, expect, it } from "vitest";
import { createRequestIdStore } from "../../../src/identity/createRequestIdStore";
import { allocateXhrSendAdmission } from "../../../src/transport/allocateXhrSendAdmission";
import { createXhrOpenMetadata } from "../../../src/transport/createXhrOpenMetadata";

describe("allocateXhrSendAdmission", () => {
  it("[NET-ID-001,003][NET-XHR-001..002][NET-FILTER-001,006..008] allocates identity before filtering stored open metadata", () => {
    const requestIds = createRequestIdStore();
    const admission = {
      baseUrl: "https://example.test/app/",
      redactionPatterns: [],
      includePatterns: ["https://example.test/api/**"],
      excludePatterns: ["https://example.test/private/**"],
      admittedRequestCount: 0,
      autoStopLimit: 2,
    } as const;

    expect(
      allocateXhrSendAdmission(
        requestIds.getNextRequestId,
        createXhrOpenMetadata({
          method: "GET",
          requestedUrl: "/private/orders?limit=10",
        }),
        admission,
      ),
    ).toEqual({
      requestId: 1,
      requestedUrl: "/private/orders?limit=10",
      normalizedRequestedUrl: "https://example.test/private/orders?limit=10",
      included: false,
      admitted: false,
      admittedRequestCount: 0,
      automaticStopTriggered: false,
    });

    expect(
      allocateXhrSendAdmission(
        requestIds.getNextRequestId,
        createXhrOpenMetadata({
          method: "POST",
          requestedUrl: "/api/orders",
        }),
        admission,
      ),
    ).toEqual({
      requestId: 2,
      requestedUrl: "/api/orders",
      normalizedRequestedUrl: "https://example.test/api/orders",
      included: true,
      admitted: true,
      admittedRequestCount: 1,
      automaticStopTriggered: false,
    });
  });
});
