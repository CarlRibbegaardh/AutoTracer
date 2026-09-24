import { describe, expect, it } from "vitest";
import { defaultNetworkTracerConfig } from "../../../src/configuration/defaultNetworkTracerConfig";
import { resolveNetworkTracerConfig } from "../../../src/configuration/resolveNetworkTracerConfig";

describe("resolveNetworkTracerConfig", () => {
  it("[NET-CONFIG-005] uses package defaults when no overrides exist", () => {
    expect(resolveNetworkTracerConfig({}, {})).toEqual(
      defaultNetworkTracerConfig,
    );
  });

  it("[NET-CONFIG-005] applies initializer defaults over package defaults", () => {
    expect(
      resolveNetworkTracerConfig(
        {
          captureRequestBody: true,
          bodyCaptureLimit: 8_192,
        },
        {},
      ),
    ).toEqual({
      ...defaultNetworkTracerConfig,
      captureRequestBody: true,
      bodyCaptureLimit: 8_192,
    });
  });

  it("[NET-CONFIG-005] applies persisted values over initializer defaults", () => {
    expect(
      resolveNetworkTracerConfig(
        {
          captureRequestBody: true,
          bodyCaptureLimit: 8_192,
        },
        {
          captureRequestBody: false,
        },
      ),
    ).toEqual({
      ...defaultNetworkTracerConfig,
      captureRequestBody: false,
      bodyCaptureLimit: 8_192,
    });
  });

  it("[NET-CONFIG-005][NET-FILTER-002] applies persisted filter lists over initializer defaults", () => {
    expect(
      resolveNetworkTracerConfig(
        {
          includePatterns: ["https://example.test/app/**"],
          excludePatterns: ["https://example.test/app/private/**"],
        },
        {
          includePatterns: ["https://api.example.test/**"],
          excludePatterns: [],
        },
      ),
    ).toEqual({
      ...defaultNetworkTracerConfig,
      includePatterns: ["https://api.example.test/**"],
      excludePatterns: [],
    });
  });

  it("[NET-CONFIG-003] returns detached filter lists", () => {
    const includePatterns = ["https://example.test/**"];
    const excludePatterns = ["https://example.test/private/**"];

    const resolved = resolveNetworkTracerConfig(
      { includePatterns, excludePatterns },
      {},
    );

    expect(resolved.includePatterns).toEqual(includePatterns);
    expect(resolved.includePatterns).not.toBe(includePatterns);
    expect(resolved.excludePatterns).toEqual(excludePatterns);
    expect(resolved.excludePatterns).not.toBe(excludePatterns);
  });

  it("does not mutate initializer defaults or persisted values", () => {
    const initializerDefaults = {
      captureRequestBody: true,
    } as const;
    const persistedConfig = {
      bodyCaptureLimit: 8_192,
    } as const;

    resolveNetworkTracerConfig(initializerDefaults, persistedConfig);

    expect(initializerDefaults).toEqual({ captureRequestBody: true });
    expect(persistedConfig).toEqual({ bodyCaptureLimit: 8_192 });
  });
});
