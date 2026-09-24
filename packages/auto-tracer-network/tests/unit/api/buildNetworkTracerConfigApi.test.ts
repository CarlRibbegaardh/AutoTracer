import { describe, expect, it } from "vitest";
import { buildNetworkTracerConfigApi } from "../../../src/api/buildNetworkTracerConfigApi";
import { createNetworkTracerConfigStore } from "../../../src/configuration/createNetworkTracerConfigStore";

describe("buildNetworkTracerConfigApi", () => {
  it("[NET-API-002..008] exposes live configuration getters and setters", () => {
    const entries = new Map<string, string>();
    const store = createNetworkTracerConfigStore(
      {
        getItem: (key) => {
          return entries.get(key) ?? null;
        },
        setItem: (key, value) => {
          entries.set(key, value);
        },
        removeItem: (key) => {
          entries.delete(key);
        },
      },
      {},
    );
    const api = buildNetworkTracerConfigApi(store);

    api.setEnabledOnLoad(true);
    api.setCaptureRequestHeaders(true);
    api.setCaptureRequestBody(true);
    api.setCaptureResponseHeaders(true);
    api.setCaptureResponseBody(true);
    api.setBodyCaptureLimit(8_192);
    api.setIncludePatterns(["https://example.test/api/**"]);
    api.setExcludePatterns(["https://example.test/private/**"]);
    api.setRedactionPatterns(["*credential*"]);
    api.setWaitForPendingRequestsOnStop(true);
    api.setAutoStopAfterRequests(25);

    expect(api.getEnabledOnLoad()).toBe(true);
    expect(api.getCaptureRequestHeaders()).toBe(true);
    expect(api.getCaptureRequestBody()).toBe(true);
    expect(api.getCaptureResponseHeaders()).toBe(true);
    expect(api.getCaptureResponseBody()).toBe(true);
    expect(api.getBodyCaptureLimit()).toBe(8_192);
    expect(api.getIncludePatterns()).toEqual(["https://example.test/api/**"]);
    expect(api.getExcludePatterns()).toEqual([
      "https://example.test/private/**",
    ]);
    expect(api.getRedactionPatterns()).toEqual(["*credential*"]);
    expect(api.getWaitForPendingRequestsOnStop()).toBe(true);
    expect(api.getAutoStopAfterRequests()).toBe(25);

    api.setAutoStopAfterRequests(undefined);
    expect(api.getAutoStopAfterRequests()).toBeUndefined();

    const snapshot = api.getConfig();
    api.setIncludePatterns([]);
    expect(snapshot.includePatterns).toEqual(["https://example.test/api/**"]);

    api.resetConfig();
    expect(api.getEnabledOnLoad()).toBe(false);
  });
});
