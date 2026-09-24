import { describe, expect, it } from "vitest";
import { getNetworkRequestAdmission } from "../../../src/automatic-stop/getNetworkRequestAdmission";

describe("getNetworkRequestAdmission", () => {
  it("[NET-FILTER-005,008..009][NET-ID-007] hides excluded requests without changing admission count", () => {
    expect(
      getNetworkRequestAdmission(
        "https://example.test/private/orders",
        {
          includePatterns: ["https://example.test/**"],
          excludePatterns: ["https://example.test/private/**"],
        },
        { admittedRequestCount: 2, autoStopLimit: 3 },
      ),
    ).toEqual({
      included: false,
      admitted: false,
      admittedRequestCount: 2,
      automaticStopTriggered: false,
    });
  });

  it("[NET-AUTOSTOP-002..004] admits the final included request and triggers automatic stop", () => {
    expect(
      getNetworkRequestAdmission(
        "https://example.test/api/orders",
        { includePatterns: [], excludePatterns: [] },
        { admittedRequestCount: 2, autoStopLimit: 3 },
      ),
    ).toEqual({
      included: true,
      admitted: true,
      admittedRequestCount: 3,
      automaticStopTriggered: true,
    });
  });

  it("[NET-AUTOSTOP-003] rejects an included request after the limit", () => {
    expect(
      getNetworkRequestAdmission(
        "https://example.test/api/orders",
        { includePatterns: [], excludePatterns: [] },
        { admittedRequestCount: 3, autoStopLimit: 3 },
      ),
    ).toEqual({
      included: true,
      admitted: false,
      admittedRequestCount: 3,
      automaticStopTriggered: false,
    });
  });
});
