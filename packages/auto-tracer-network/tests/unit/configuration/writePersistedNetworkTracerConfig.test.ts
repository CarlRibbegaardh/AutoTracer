import { describe, expect, it } from "vitest";
import { readPersistedNetworkTracerConfig } from "../../../src/configuration/readPersistedNetworkTracerConfig";
import { writePersistedNetworkTracerConfig } from "../../../src/configuration/writePersistedNetworkTracerConfig";

/** Provides in-memory operations used by the persistence tests. */
type MemoryStorage = {
  readonly getItem: (key: string) => string | null;
  readonly setItem: (key: string, value: string) => void;
};

/** Exposes storage and its written keys to persistence tests. */
type MemoryStorageFixture = {
  readonly storage: MemoryStorage;
  readonly keys: () => readonly string[];
};

/**
 * Creates an empty in-memory storage fixture.
 *
 * @returns Storage and an operation for inspecting its keys.
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
    },
    keys: () => {
      return [...entries.keys()];
    },
  };
}

describe("writePersistedNetworkTracerConfig", () => {
  it("[NET-CONFIG-007] writes one versioned document at the approved storage key", () => {
    const fixture = createMemoryStorage();

    writePersistedNetworkTracerConfig(fixture.storage, {
      captureRequestBody: true,
    });

    expect(fixture.keys()).toEqual(["__autotracer.network.config.v1"]);
    expect(
      JSON.parse(
        fixture.storage.getItem("__autotracer.network.config.v1") ?? "null",
      ),
    ).toEqual({
      version: 1,
      config: { captureRequestBody: true },
    });
  });

  it("[NET-CAPTURE-003][NET-BODY-002][NET-STOP-001] reloads persisted settings", () => {
    const fixture = createMemoryStorage();
    const persistedConfig = {
      enabledOnLoad: true,
      captureRequestHeaders: true,
      captureRequestBody: true,
      captureResponseHeaders: true,
      captureResponseBody: true,
      bodyCaptureLimit: 8_192,
      redactionPatterns: ["*private*"],
      waitForPendingRequestsOnStop: true,
      autoStopAfterRequests: 25,
    } as const;

    writePersistedNetworkTracerConfig(fixture.storage, persistedConfig);

    expect(readPersistedNetworkTracerConfig(fixture.storage)).toEqual(
      persistedConfig,
    );
  });
});
