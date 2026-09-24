import { describe, expect, it } from "vitest";
import { defaultNetworkTracerConfig } from "../../../src/configuration/defaultNetworkTracerConfig";
import { defaultRedactionPatterns } from "../../../src/redaction/defaultRedactionPatterns";

describe("defaultNetworkTracerConfig", () => {
  it("[NET-CAPTURE-001][NET-CAPTURE-002] disables each capture setting independently", () => {
    expect(defaultNetworkTracerConfig.captureRequestHeaders).toBe(false);
    expect(defaultNetworkTracerConfig.captureRequestBody).toBe(false);
    expect(defaultNetworkTracerConfig.captureResponseHeaders).toBe(false);
    expect(defaultNetworkTracerConfig.captureResponseBody).toBe(false);
  });

  it("[NET-BODY-001] uses a 64 KiB body capture limit", () => {
    expect(defaultNetworkTracerConfig.bodyCaptureLimit).toBe(64 * 1_024);
  });

  it("[NET-STOP-001] disables waiting for pending requests on manual stop", () => {
    expect(defaultNetworkTracerConfig.waitForPendingRequestsOnStop).toBe(false);
  });

  it("[NET-AUTOSTOP-001] disables automatic stop", () => {
    expect(defaultNetworkTracerConfig.autoStopAfterRequests).toBeUndefined();
  });

  it("[NET-FILTER-002] defaults include and exclude patterns to empty lists", () => {
    expect(defaultNetworkTracerConfig.includePatterns).toEqual([]);
    expect(defaultNetworkTracerConfig.excludePatterns).toEqual([]);
  });

  it("[NET-CONFIG-011] disables tracing on load", () => {
    expect(defaultNetworkTracerConfig.enabledOnLoad).toBe(false);
  });

  it("[NET-REDACT-004] uses the approved redaction patterns", () => {
    expect(defaultNetworkTracerConfig.redactionPatterns).toEqual(
      defaultRedactionPatterns,
    );
  });
});
