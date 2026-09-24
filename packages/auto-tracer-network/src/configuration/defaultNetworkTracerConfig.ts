import type { NetworkTracerConfig } from "./NetworkTracerConfig.js";
import { defaultRedactionPatterns } from "../redaction/defaultRedactionPatterns.js";

/**
 * Package defaults used when no initializer or persisted value overrides them.
 */
export const defaultNetworkTracerConfig: NetworkTracerConfig = {
  enabledOnLoad: false,
  captureRequestHeaders: false,
  captureRequestBody: false,
  captureResponseHeaders: false,
  captureResponseBody: false,
  bodyCaptureLimit: 64 * 1_024,
  redactionPatterns: defaultRedactionPatterns,
  includePatterns: [],
  excludePatterns: [],
  waitForPendingRequestsOnStop: false,
  autoStopAfterRequests: undefined,
};
