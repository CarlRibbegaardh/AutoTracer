import { describe, expect, it } from "vitest";
import { createNetworkTracerConfigStore } from "../../../src/configuration/createNetworkTracerConfigStore";
import { defaultNetworkTracerConfig } from "../../../src/configuration/defaultNetworkTracerConfig";
import { readPersistedNetworkTracerConfig } from "../../../src/configuration/readPersistedNetworkTracerConfig";

/** Provides read and write operations used by the configuration-store tests. */
type MemoryStorage = {
  readonly getItem: (key: string) => string | null;
  readonly setItem: (key: string, value: string) => void;
  readonly removeItem: (key: string) => void;
};

/** Exposes storage and raw values to configuration-store tests. */
type MemoryStorageFixture = {
  readonly storage: MemoryStorage;
  readonly readRaw: (key: string) => string | null;
};

/**
 * Creates an empty in-memory storage fixture.
 *
 * @returns Storage and an operation for inspecting serialized values.
 */
function createMemoryStorage(): MemoryStorageFixture {
  const entries = new Map<string, string>();
  return {
    storage: {
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
    readRaw: (key) => {
      return entries.get(key) ?? null;
    },
  };
}

describe("createNetworkTracerConfigStore", () => {
  it("[NET-CONFIG-003] returns an immutable configuration snapshot", () => {
    const fixture = createMemoryStorage();
    const store = createNetworkTracerConfigStore(fixture.storage, {});

    const firstSnapshot = store.getConfig();
    store.setBodyCaptureLimit(8_192);
    const secondSnapshot = store.getConfig();

    expect(firstSnapshot.bodyCaptureLimit).toBe(64 * 1_024);
    expect(secondSnapshot.bodyCaptureLimit).toBe(8_192);
    expect(firstSnapshot).not.toBe(secondSnapshot);
    expect(firstSnapshot.redactionPatterns).not.toBe(
      secondSnapshot.redactionPatterns,
    );
    expect(firstSnapshot.includePatterns).not.toBe(
      secondSnapshot.includePatterns,
    );
    expect(firstSnapshot.excludePatterns).not.toBe(
      secondSnapshot.excludePatterns,
    );
  });

  it("[NET-BODY-002][NET-CONFIG-006] persists a live body-limit change immediately", () => {
    const fixture = createMemoryStorage();
    const store = createNetworkTracerConfigStore(fixture.storage, {});

    store.setBodyCaptureLimit(8_192);

    expect(store.getConfig()).toEqual({
      ...defaultNetworkTracerConfig,
      bodyCaptureLimit: 8_192,
    });
    expect(readPersistedNetworkTracerConfig(fixture.storage)).toEqual({
      bodyCaptureLimit: 8_192,
    });
  });

  it("[NET-CAPTURE-003][NET-CONFIG-006] persists all four live capture changes immediately", () => {
    const fixture = createMemoryStorage();
    const store = createNetworkTracerConfigStore(fixture.storage, {});
    store.setBodyCaptureLimit(8_192);

    store.setCaptureRequestHeaders(true);
    store.setCaptureRequestBody(true);
    store.setCaptureResponseHeaders(true);
    store.setCaptureResponseBody(true);

    expect(store.getConfig()).toEqual({
      ...defaultNetworkTracerConfig,
      captureRequestHeaders: true,
      captureRequestBody: true,
      captureResponseHeaders: true,
      captureResponseBody: true,
      bodyCaptureLimit: 8_192,
    });
    expect(readPersistedNetworkTracerConfig(fixture.storage)).toEqual({
      captureRequestHeaders: true,
      captureRequestBody: true,
      captureResponseHeaders: true,
      captureResponseBody: true,
      bodyCaptureLimit: 8_192,
    });
  });

  it("[NET-CONFIG-006][NET-STOP-001][NET-AUTOSTOP-001] persists defined scalar changes immediately", () => {
    const fixture = createMemoryStorage();
    const store = createNetworkTracerConfigStore(fixture.storage, {});

    store.setEnabledOnLoad(true);
    store.setWaitForPendingRequestsOnStop(true);
    store.setAutoStopAfterRequests(25);

    expect(store.getConfig()).toEqual({
      ...defaultNetworkTracerConfig,
      enabledOnLoad: true,
      waitForPendingRequestsOnStop: true,
      autoStopAfterRequests: 25,
    });
    expect(readPersistedNetworkTracerConfig(fixture.storage)).toEqual({
      enabledOnLoad: true,
      waitForPendingRequestsOnStop: true,
      autoStopAfterRequests: 25,
    });
  });

  it("[NET-REDACT-005] replaces or clears the persisted redaction list", () => {
    const fixture = createMemoryStorage();
    const store = createNetworkTracerConfigStore(fixture.storage, {});

    store.setRedactionPatterns(["*private*"]);
    expect(store.getConfig().redactionPatterns).toEqual(["*private*"]);
    expect(readPersistedNetworkTracerConfig(fixture.storage)).toEqual({
      redactionPatterns: ["*private*"],
    });

    store.setRedactionPatterns([]);
    expect(store.getConfig().redactionPatterns).toEqual([]);
    expect(readPersistedNetworkTracerConfig(fixture.storage)).toEqual({
      redactionPatterns: [],
    });
  });

  it("[NET-CONFIG-006][NET-FILTER-002..003] replaces, clears, and persists detached filter lists", () => {
    const fixture = createMemoryStorage();
    const store = createNetworkTracerConfigStore(fixture.storage, {});
    const includePatterns = ["https://example.test/api/**"];
    const excludePatterns = ["https://example.test/private/**"];

    store.setIncludePatterns(includePatterns);
    store.setExcludePatterns(excludePatterns);
    includePatterns.push("https://mutated.example.test/**");
    excludePatterns.push("https://mutated.example.test/**");

    expect(store.getConfig().includePatterns).toEqual([
      "https://example.test/api/**",
    ]);
    expect(store.getConfig().excludePatterns).toEqual([
      "https://example.test/private/**",
    ]);
    expect(readPersistedNetworkTracerConfig(fixture.storage)).toEqual({
      includePatterns: ["https://example.test/api/**"],
      excludePatterns: ["https://example.test/private/**"],
    });

    store.setIncludePatterns([]);
    store.setExcludePatterns([]);

    expect(store.getConfig().includePatterns).toEqual([]);
    expect(store.getConfig().excludePatterns).toEqual([]);
  });

  it("[NET-CONFIG-013][NET-CONFIG-015] rejects malformed globs without changing persisted filters", () => {
    const fixture = createMemoryStorage();
    const store = createNetworkTracerConfigStore(fixture.storage, {});
    store.setIncludePatterns(["/api/**"]);
    store.setExcludePatterns(["/api/health"]);
    const previousDocument = fixture.readRaw(
      "__autotracer.network.config.v1",
    );

    expect(() => store.setIncludePatterns(["**/*.{malformed"])).toThrow(
      "NetworkTracer: includePatterns contains an invalid glob: **/*.{malformed",
    );
    expect(() => store.setExcludePatterns(["**/*.{malformed"])).toThrow(
      "NetworkTracer: excludePatterns contains an invalid glob: **/*.{malformed",
    );

    expect(store.getConfig().includePatterns).toEqual(["/api/**"]);
    expect(store.getConfig().excludePatterns).toEqual(["/api/health"]);
    expect(fixture.readRaw("__autotracer.network.config.v1")).toBe(
      previousDocument,
    );
  });

  it("[NET-CONFIG-013][NET-CONFIG-014] retains the automatic-stop limit after invalid input", () => {
    const fixture = createMemoryStorage();
    const store = createNetworkTracerConfigStore(fixture.storage, {});
    store.setAutoStopAfterRequests(25);
    const previousDocument = fixture.readRaw(
      "__autotracer.network.config.v1",
    );

    expect(() => store.setAutoStopAfterRequests(0)).toThrow(
      "NetworkTracer: autoStopAfterRequests must be a positive integer or undefined",
    );

    expect(store.getConfig().autoStopAfterRequests).toBe(25);
    expect(fixture.readRaw("__autotracer.network.config.v1")).toBe(
      previousDocument,
    );
  });

  it("[NET-CONFIG-004][NET-CONFIG-010][NET-CONFIG-011] clears persistence and restores defaults", () => {
    const fixture = createMemoryStorage();
    const initializerDefaults = {
      enabledOnLoad: true,
      captureRequestBody: true,
      bodyCaptureLimit: 8_192,
    } as const;
    const store = createNetworkTracerConfigStore(
      fixture.storage,
      initializerDefaults,
    );
    store.setCaptureRequestBody(false);
    store.setBodyCaptureLimit(4_096);
    store.setEnabledOnLoad(true);

    store.resetConfig();

    expect(store.getConfig()).toEqual({
      ...defaultNetworkTracerConfig,
      ...initializerDefaults,
      enabledOnLoad: false,
    });
    expect(readPersistedNetworkTracerConfig(fixture.storage)).toBeUndefined();
  });

  it("[NET-CONFIG-013][NET-CONFIG-014] retains the previous setting after invalid input", () => {
    const fixture = createMemoryStorage();
    const store = createNetworkTracerConfigStore(fixture.storage, {});
    store.setBodyCaptureLimit(8_192);
    const previousDocument = fixture.readRaw(
      "__autotracer.network.config.v1",
    );

    expect(() => store.setBodyCaptureLimit(0)).toThrow(
      "NetworkTracer: bodyCaptureLimit must be a positive integer",
    );

    expect(store.getConfig().bodyCaptureLimit).toBe(8_192);
    expect(fixture.readRaw("__autotracer.network.config.v1")).toBe(
      previousDocument,
    );
  });
});
