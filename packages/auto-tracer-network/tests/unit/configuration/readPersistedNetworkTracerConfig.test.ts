import { describe, expect, it } from "vitest";
import { readPersistedNetworkTracerConfig } from "../../../src/configuration/readPersistedNetworkTracerConfig";

/** Provides the storage operation used by the test fixture. */
type MemoryStorage = {
  readonly getItem: (key: string) => string | null;
};

/**
 * Creates read-only in-memory storage.
 *
 * @param entries - Values exposed by the storage fixture.
 * @returns Storage backed by the supplied values.
 */
function createMemoryStorage(
  entries: Readonly<Record<string, string>>,
): MemoryStorage {
  return {
    getItem: (key) => {
      return entries[key] ?? null;
    },
  };
}

describe("readPersistedNetworkTracerConfig", () => {
  it("[NET-CONFIG-008] ignores an absent document", () => {
    expect(readPersistedNetworkTracerConfig(createMemoryStorage({}))).toBeUndefined();
  });

  it("[NET-CONFIG-007] reads one versioned configuration document from the network storage key", () => {
    const storage = createMemoryStorage({
      "__autotracer.network.config.v1": JSON.stringify({
        version: 1,
        config: {
          captureRequestBody: true,
          bodyCaptureLimit: 8_192,
        },
      }),
    });

    expect(readPersistedNetworkTracerConfig(storage)).toEqual({
      captureRequestBody: true,
      bodyCaptureLimit: 8_192,
    });
  });

  it("[NET-CONFIG-007] reads every defined persisted configuration field", () => {
    const storage = createMemoryStorage({
      "__autotracer.network.config.v1": JSON.stringify({
        version: 1,
        config: {
          enabledOnLoad: true,
          captureRequestHeaders: true,
          captureRequestBody: true,
          captureResponseHeaders: true,
          captureResponseBody: true,
          bodyCaptureLimit: 8_192,
          redactionPatterns: ["*private*"],
          includePatterns: ["https://example.test/api/**"],
          excludePatterns: ["https://example.test/private/**"],
          waitForPendingRequestsOnStop: true,
          autoStopAfterRequests: 25,
        },
      }),
    });

    expect(readPersistedNetworkTracerConfig(storage)).toEqual({
      enabledOnLoad: true,
      captureRequestHeaders: true,
      captureRequestBody: true,
      captureResponseHeaders: true,
      captureResponseBody: true,
      bodyCaptureLimit: 8_192,
      redactionPatterns: ["*private*"],
      includePatterns: ["https://example.test/api/**"],
      excludePatterns: ["https://example.test/private/**"],
      waitForPendingRequestsOnStop: true,
      autoStopAfterRequests: 25,
    });
  });

  it("[NET-CONFIG-008] ignores malformed JSON as a whole", () => {
    const storage = createMemoryStorage({
      "__autotracer.network.config.v1": "{invalid",
    });

    expect(readPersistedNetworkTracerConfig(storage)).toBeUndefined();
  });

  it.each([
    "null",
    '"configuration"',
    "{}",
    '{"version":1}',
    '{"version":1,"config":null}',
    '{"version":1,"config":"invalid"}',
  ])(
    "[NET-CONFIG-008] ignores the malformed document shape %s as a whole",
    (rawDocument) => {
      expect(
        readPersistedNetworkTracerConfig(
          createMemoryStorage({
            "__autotracer.network.config.v1": rawDocument,
          }),
        ),
      ).toBeUndefined();
    },
  );

  it("[NET-CONFIG-008] ignores a document containing an invalid setting as a whole", () => {
    const storage = createMemoryStorage({
      "__autotracer.network.config.v1": JSON.stringify({
        version: 1,
        config: {
          captureRequestBody: true,
          bodyCaptureLimit: "8192",
        },
      }),
    });

    expect(readPersistedNetworkTracerConfig(storage)).toBeUndefined();
  });

  it.each([
    "enabledOnLoad",
    "captureRequestHeaders",
    "captureRequestBody",
    "captureResponseHeaders",
    "captureResponseBody",
    "waitForPendingRequestsOnStop",
  ])(
    "[NET-CONFIG-008] ignores invalid boolean setting %s as a whole",
    (setting) => {
      const storage = createMemoryStorage({
        "__autotracer.network.config.v1": JSON.stringify({
          version: 1,
          config: { [setting]: "true" },
        }),
      });

      expect(readPersistedNetworkTracerConfig(storage)).toBeUndefined();
    },
  );

  it.each(["private", ["private", 42]])(
    "[NET-CONFIG-008] ignores invalid redaction patterns %j as a whole",
    (redactionPatterns) => {
      const storage = createMemoryStorage({
        "__autotracer.network.config.v1": JSON.stringify({
          version: 1,
          config: { redactionPatterns },
        }),
      });

      expect(readPersistedNetworkTracerConfig(storage)).toBeUndefined();
    },
  );

  it.each([
    ["includePatterns", "https://example.test/**"],
    ["includePatterns", ["https://example.test/**", 42]],
    ["excludePatterns", "https://example.test/private/**"],
    ["excludePatterns", ["https://example.test/private/**", 42]],
  ])(
    "[NET-CONFIG-008][NET-FILTER-003] ignores invalid %s as a whole",
    (setting, value) => {
      const storage = createMemoryStorage({
        "__autotracer.network.config.v1": JSON.stringify({
          version: 1,
          config: { [setting]: value },
        }),
      });

      expect(readPersistedNetworkTracerConfig(storage)).toBeUndefined();
    },
  );

  it.each([0, 1.5])(
    "[NET-CONFIG-008] ignores the invalid body capture limit %s as a whole",
    (bodyCaptureLimit) => {
      expect(
        readPersistedNetworkTracerConfig(
          createMemoryStorage({
            "__autotracer.network.config.v1": JSON.stringify({
              version: 1,
              config: { bodyCaptureLimit },
            }),
          }),
        ),
      ).toBeUndefined();
    },
  );

  it.each([0, 1.5, "25"])(
    "[NET-CONFIG-008] ignores the invalid automatic-stop limit %s as a whole",
    (autoStopAfterRequests) => {
      const storage = createMemoryStorage({
        "__autotracer.network.config.v1": JSON.stringify({
          version: 1,
          config: { autoStopAfterRequests },
        }),
      });

      expect(readPersistedNetworkTracerConfig(storage)).toBeUndefined();
    },
  );

  it("returns a cloned redaction-pattern snapshot", () => {
    const redactionPatterns = ["*private*"];
    const storage = createMemoryStorage({
      "__autotracer.network.config.v1": JSON.stringify({
        version: 1,
        config: { redactionPatterns },
      }),
    });

    const persistedConfig = readPersistedNetworkTracerConfig(storage);

    expect(persistedConfig?.redactionPatterns).toEqual(redactionPatterns);
    expect(persistedConfig?.redactionPatterns).not.toBe(redactionPatterns);
  });

  it("[NET-CONFIG-003] returns cloned filter-list snapshots", () => {
    const includePatterns = ["https://example.test/**"];
    const excludePatterns = ["https://example.test/private/**"];
    const storage = createMemoryStorage({
      "__autotracer.network.config.v1": JSON.stringify({
        version: 1,
        config: { includePatterns, excludePatterns },
      }),
    });

    const persistedConfig = readPersistedNetworkTracerConfig(storage);

    expect(persistedConfig?.includePatterns).toEqual(includePatterns);
    expect(persistedConfig?.includePatterns).not.toBe(includePatterns);
    expect(persistedConfig?.excludePatterns).toEqual(excludePatterns);
    expect(persistedConfig?.excludePatterns).not.toBe(excludePatterns);
  });

  it("[NET-CONFIG-008] ignores an unknown version 1 setting as a whole", () => {
    const storage = createMemoryStorage({
      "__autotracer.network.config.v1": JSON.stringify({
        version: 1,
        config: {
          captureRequestBody: true,
          unknownSetting: true,
        },
      }),
    });

    expect(readPersistedNetworkTracerConfig(storage)).toBeUndefined();
  });

  it("[NET-CONFIG-009] ignores an unsupported document version without migration", () => {
    const storage = createMemoryStorage({
      "__autotracer.network.config.v1": JSON.stringify({
        version: 0,
        config: {
          captureRequestBody: true,
        },
      }),
    });

    expect(readPersistedNetworkTracerConfig(storage)).toBeUndefined();
  });
});
