import type { NetworkTracerConfigStore } from "../configuration/NetworkTracerConfigStore.js";
import type { NetworkTracerConfigApi } from "./NetworkTracerConfigApi.js";

/**
 * Builds the public configuration API from a live configuration store.
 *
 * @param configStore - Live configuration operations.
 * @returns Public configuration getters and setters.
 */
export function buildNetworkTracerConfigApi(
  configStore: NetworkTracerConfigStore,
): NetworkTracerConfigApi {
  return {
    getEnabledOnLoad: () => {return configStore.getConfig().enabledOnLoad},
    setEnabledOnLoad: configStore.setEnabledOnLoad,
    getCaptureRequestHeaders: () =>
      {return configStore.getConfig().captureRequestHeaders},
    setCaptureRequestHeaders: configStore.setCaptureRequestHeaders,
    getCaptureRequestBody: () => {return configStore.getConfig().captureRequestBody},
    setCaptureRequestBody: configStore.setCaptureRequestBody,
    getCaptureResponseHeaders: () =>
      {return configStore.getConfig().captureResponseHeaders},
    setCaptureResponseHeaders: configStore.setCaptureResponseHeaders,
    getCaptureResponseBody: () => {return configStore.getConfig().captureResponseBody},
    setCaptureResponseBody: configStore.setCaptureResponseBody,
    getBodyCaptureLimit: () => {return configStore.getConfig().bodyCaptureLimit},
    setBodyCaptureLimit: configStore.setBodyCaptureLimit,
    getIncludePatterns: () => {return configStore.getConfig().includePatterns},
    setIncludePatterns: configStore.setIncludePatterns,
    getExcludePatterns: () => {return configStore.getConfig().excludePatterns},
    setExcludePatterns: configStore.setExcludePatterns,
    getRedactionPatterns: () => {return configStore.getConfig().redactionPatterns},
    setRedactionPatterns: configStore.setRedactionPatterns,
    getWaitForPendingRequestsOnStop: () =>
      {return configStore.getConfig().waitForPendingRequestsOnStop},
    setWaitForPendingRequestsOnStop:
      configStore.setWaitForPendingRequestsOnStop,
    getAutoStopAfterRequests: () =>
      {return configStore.getConfig().autoStopAfterRequests},
    setAutoStopAfterRequests: configStore.setAutoStopAfterRequests,
    getConfig: configStore.getConfig,
    resetConfig: configStore.resetConfig,
  };
}
