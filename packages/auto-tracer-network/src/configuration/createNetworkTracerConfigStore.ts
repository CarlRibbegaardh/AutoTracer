import type { NetworkTracerConfigReadWriteStorage } from "./NetworkTracerConfigReadWriteStorage.js";
import type { NetworkTracerConfigStore } from "./NetworkTracerConfigStore.js";
import type { NetworkTracerConfigOverrides } from "./NetworkTracerConfigOverrides.js";
import { readPersistedNetworkTracerConfig } from "./readPersistedNetworkTracerConfig.js";
import { resolveNetworkTracerConfig } from "./resolveNetworkTracerConfig.js";
import { validateAutoStopAfterRequests } from "./validateAutoStopAfterRequests.js";
import { validateBodyCaptureLimit } from "./validateBodyCaptureLimit.js";
import { writePersistedNetworkTracerConfig } from "./writePersistedNetworkTracerConfig.js";

/**
 * Creates a live NetworkTracer configuration store.
 *
 * @param storage - Storage used to load and persist developer overrides.
 * @param initializerDefaults - Project defaults supplied at initialization.
 * @returns Live configuration operations for the implemented settings.
 */
export function createNetworkTracerConfigStore(
  storage: NetworkTracerConfigReadWriteStorage,
  initializerDefaults: NetworkTracerConfigOverrides,
): NetworkTracerConfigStore {
  let persistedConfig = readPersistedNetworkTracerConfig(storage) ?? {};
  let currentConfig = resolveNetworkTracerConfig(
    initializerDefaults,
    persistedConfig,
  );

  /** Returns a detached configuration snapshot. */
  function getConfig() {
    return {
      ...currentConfig,
      redactionPatterns: [...currentConfig.redactionPatterns],
      includePatterns: [...currentConfig.includePatterns],
      excludePatterns: [...currentConfig.excludePatterns],
    };
  }

  /** Persists enabled-on-load before updating live state. */
  function setEnabledOnLoad(value: boolean): void {
    const nextPersistedConfig = { ...persistedConfig, enabledOnLoad: value };
    writePersistedNetworkTracerConfig(storage, nextPersistedConfig);
    persistedConfig = nextPersistedConfig;
    currentConfig = resolveNetworkTracerConfig(
      initializerDefaults,
      persistedConfig,
    );
  }

  /** Persists request-header capture enablement before updating live state. */
  function setCaptureRequestHeaders(value: boolean): void {
    const nextPersistedConfig = {
      ...persistedConfig,
      captureRequestHeaders: value,
    };
    writePersistedNetworkTracerConfig(storage, nextPersistedConfig);
    persistedConfig = nextPersistedConfig;
    currentConfig = resolveNetworkTracerConfig(
      initializerDefaults,
      persistedConfig,
    );
  }

  /** Persists request-body capture enablement before updating live state. */
  function setCaptureRequestBody(value: boolean): void {
    const nextPersistedConfig = {
      ...persistedConfig,
      captureRequestBody: value,
    };
    writePersistedNetworkTracerConfig(storage, nextPersistedConfig);
    persistedConfig = nextPersistedConfig;
    currentConfig = resolveNetworkTracerConfig(
      initializerDefaults,
      persistedConfig,
    );
  }

  /** Persists response-header capture enablement before updating live state. */
  function setCaptureResponseHeaders(value: boolean): void {
    const nextPersistedConfig = {
      ...persistedConfig,
      captureResponseHeaders: value,
    };
    writePersistedNetworkTracerConfig(storage, nextPersistedConfig);
    persistedConfig = nextPersistedConfig;
    currentConfig = resolveNetworkTracerConfig(
      initializerDefaults,
      persistedConfig,
    );
  }

  /** Persists response-body capture enablement before updating live state. */
  function setCaptureResponseBody(value: boolean): void {
    const nextPersistedConfig = {
      ...persistedConfig,
      captureResponseBody: value,
    };
    writePersistedNetworkTracerConfig(storage, nextPersistedConfig);
    persistedConfig = nextPersistedConfig;
    currentConfig = resolveNetworkTracerConfig(
      initializerDefaults,
      persistedConfig,
    );
  }

  /** Persists a validated body capture limit before updating live state. */
  function setBodyCaptureLimit(value: number): void {
    const bodyCaptureLimit = validateBodyCaptureLimit(value);
    const nextPersistedConfig = { ...persistedConfig, bodyCaptureLimit };
    writePersistedNetworkTracerConfig(storage, nextPersistedConfig);
    persistedConfig = nextPersistedConfig;
    currentConfig = resolveNetworkTracerConfig(
      initializerDefaults,
      persistedConfig,
    );
  }

  /** Persists manual-stop waiting before updating live state. */
  function setWaitForPendingRequestsOnStop(value: boolean): void {
    const nextPersistedConfig = {
      ...persistedConfig,
      waitForPendingRequestsOnStop: value,
    };
    writePersistedNetworkTracerConfig(storage, nextPersistedConfig);
    persistedConfig = nextPersistedConfig;
    currentConfig = resolveNetworkTracerConfig(
      initializerDefaults,
      persistedConfig,
    );
  }

  /** Persists a validated automatic-stop limit before updating live state. */
  function setAutoStopAfterRequests(value: number | undefined): void {
    const autoStopAfterRequests = validateAutoStopAfterRequests(value);
    const nextPersistedConfig = {
      ...persistedConfig,
      autoStopAfterRequests,
    };
    writePersistedNetworkTracerConfig(storage, nextPersistedConfig);
    persistedConfig = nextPersistedConfig;
    currentConfig = resolveNetworkTracerConfig(
      initializerDefaults,
      persistedConfig,
    );
  }

  /** Persists a detached redaction-pattern list before updating live state. */
  function setRedactionPatterns(value: readonly string[]): void {
    const redactionPatterns = [...value];
    const nextPersistedConfig = { ...persistedConfig, redactionPatterns };
    writePersistedNetworkTracerConfig(storage, nextPersistedConfig);
    persistedConfig = nextPersistedConfig;
    currentConfig = resolveNetworkTracerConfig(
      initializerDefaults,
      persistedConfig,
    );
  }

  /** Persists a detached URL inclusion-pattern list. */
  function setIncludePatterns(value: readonly string[]): void {
    const invalidPattern = value.find(
      (pattern) =>
        {return pattern.includes("{") !== pattern.includes("}")},
    );
    if (invalidPattern !== undefined) {
      throw new Error(
        `NetworkTracer: includePatterns contains an invalid glob: ${invalidPattern}`,
      );
    }
    const includePatterns = [...value];
    const nextPersistedConfig = { ...persistedConfig, includePatterns };
    writePersistedNetworkTracerConfig(storage, nextPersistedConfig);
    persistedConfig = nextPersistedConfig;
    currentConfig = resolveNetworkTracerConfig(
      initializerDefaults,
      persistedConfig,
    );
  }

  /** Persists a detached URL exclusion-pattern list. */
  function setExcludePatterns(value: readonly string[]): void {
    const invalidPattern = value.find(
      (pattern) =>
        {return pattern.includes("{") !== pattern.includes("}")},
    );
    if (invalidPattern !== undefined) {
      throw new Error(
        `NetworkTracer: excludePatterns contains an invalid glob: ${invalidPattern}`,
      );
    }
    const excludePatterns = [...value];
    const nextPersistedConfig = { ...persistedConfig, excludePatterns };
    writePersistedNetworkTracerConfig(storage, nextPersistedConfig);
    persistedConfig = nextPersistedConfig;
    currentConfig = resolveNetworkTracerConfig(
      initializerDefaults,
      persistedConfig,
    );
  }

  /** Clears persisted settings before restoring live defaults. */
  function resetConfig(): void {
    storage.removeItem("__autotracer.network.config.v1");
    persistedConfig = { enabledOnLoad: false };
    currentConfig = resolveNetworkTracerConfig(
      initializerDefaults,
      persistedConfig,
    );
  }

  return {
    getConfig,
    setEnabledOnLoad,
    setCaptureRequestHeaders,
    setCaptureRequestBody,
    setCaptureResponseHeaders,
    setCaptureResponseBody,
    setBodyCaptureLimit,
    setWaitForPendingRequestsOnStop,
    setAutoStopAfterRequests,
    setRedactionPatterns,
    setIncludePatterns,
    setExcludePatterns,
    resetConfig,
  };
}
