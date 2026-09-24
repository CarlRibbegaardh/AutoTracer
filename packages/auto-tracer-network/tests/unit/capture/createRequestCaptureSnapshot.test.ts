import { describe, expect, it } from "vitest";
import type { NetworkTracerConfig } from "../../../src/configuration/NetworkTracerConfig";
import { createRequestCaptureSnapshot } from "../../../src/capture/createRequestCaptureSnapshot";

describe("createRequestCaptureSnapshot", () => {
  it("[NET-CAPTURE-006] snapshots capture flags, body limit, and redaction patterns", () => {
    const config: NetworkTracerConfig = {
      enabledOnLoad: true,
      captureRequestHeaders: true,
      captureRequestBody: false,
      captureResponseHeaders: true,
      captureResponseBody: false,
      bodyCaptureLimit: 4_096,
      redactionPatterns: ["authorization", "*token*"],
      includePatterns: [],
      excludePatterns: [],
      waitForPendingRequestsOnStop: true,
      autoStopAfterRequests: 10,
    };

    expect(createRequestCaptureSnapshot(config)).toEqual({
      captureRequestHeaders: true,
      captureRequestBody: false,
      captureResponseHeaders: true,
      captureResponseBody: false,
      bodyCaptureLimit: 4_096,
      redactionPatterns: ["authorization", "*token*"],
    });
  });

  it("[NET-CAPTURE-006] detaches snapshotted redaction patterns", () => {
    const redactionPatterns = ["*token*"];
    const config: NetworkTracerConfig = {
      enabledOnLoad: false,
      captureRequestHeaders: false,
      captureRequestBody: false,
      captureResponseHeaders: false,
      captureResponseBody: false,
      bodyCaptureLimit: 1_024,
      redactionPatterns,
      includePatterns: [],
      excludePatterns: [],
      waitForPendingRequestsOnStop: false,
      autoStopAfterRequests: undefined,
    };

    const snapshot = createRequestCaptureSnapshot(config);
    redactionPatterns.push("*secret*");

    expect(snapshot.redactionPatterns).toEqual(["*token*"]);
  });

  it("[NET-CAPTURE-007] applies changed settings only to later snapshots", () => {
    const initialConfig: NetworkTracerConfig = {
      enabledOnLoad: false,
      captureRequestHeaders: false,
      captureRequestBody: false,
      captureResponseHeaders: false,
      captureResponseBody: false,
      bodyCaptureLimit: 1_024,
      redactionPatterns: [],
      includePatterns: [],
      excludePatterns: [],
      waitForPendingRequestsOnStop: false,
      autoStopAfterRequests: undefined,
    };

    const initialSnapshot = createRequestCaptureSnapshot(initialConfig);
    const laterSnapshot = createRequestCaptureSnapshot({
      ...initialConfig,
      captureRequestBody: true,
      bodyCaptureLimit: 2_048,
    });

    expect(initialSnapshot.captureRequestBody).toBe(false);
    expect(initialSnapshot.bodyCaptureLimit).toBe(1_024);
    expect(laterSnapshot.captureRequestBody).toBe(true);
    expect(laterSnapshot.bodyCaptureLimit).toBe(2_048);
  });
});
