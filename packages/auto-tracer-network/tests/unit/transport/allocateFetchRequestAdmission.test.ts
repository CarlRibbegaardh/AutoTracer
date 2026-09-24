import { describe, expect, it } from "vitest";
import { createRequestIdStore } from "../../../src/identity/createRequestIdStore";
import { allocateFetchRequestAdmission } from "../../../src/transport/allocateFetchRequestAdmission";

describe("allocateFetchRequestAdmission", () => {
  it("[NET-ID-001][NET-FILTER-001,006..008][NET-URL-004] filters a relative Fetch URL by its normalized absolute value", () => {
    const requestIds = createRequestIdStore();

    expect(
      allocateFetchRequestAdmission(
        requestIds.getNextRequestId,
        "/private/orders?limit=10",
        {
          baseUrl: "https://example.test/app/",
          redactionPatterns: [],
          includePatterns: [],
          excludePatterns: ["https://example.test/private/**"],
          admittedRequestCount: 0,
          autoStopLimit: 2,
        },
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
  });

  it("[NET-ID-003][NET-FILTER-001][NET-URL-004] admits the next URL input after a hidden request with an ID gap", () => {
    const requestIds = createRequestIdStore();
    const admission = {
      baseUrl: "https://example.test/app/",
      redactionPatterns: [],
      includePatterns: ["https://example.test/api/**"],
      excludePatterns: ["https://example.test/private/**"],
      admittedRequestCount: 0,
      autoStopLimit: 2,
    } as const;

    allocateFetchRequestAdmission(
      requestIds.getNextRequestId,
      "/private/orders",
      admission,
    );

    expect(
      allocateFetchRequestAdmission(
        requestIds.getNextRequestId,
        new URL("https://example.test/api/orders"),
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
