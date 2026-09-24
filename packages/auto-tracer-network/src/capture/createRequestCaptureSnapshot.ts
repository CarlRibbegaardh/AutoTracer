import type { NetworkTracerConfig } from "../configuration/NetworkTracerConfig.js";
import type { RequestCaptureSnapshot } from "./RequestCaptureSnapshot.js";

/**
 * Creates a detached snapshot of request-scoped capture settings.
 *
 * @param config - Live configuration at request admission.
 * @returns Capture settings retained for the admitted request.
 */
export function createRequestCaptureSnapshot(
  config: NetworkTracerConfig,
): RequestCaptureSnapshot {
  return {
    captureRequestHeaders: config.captureRequestHeaders,
    captureRequestBody: config.captureRequestBody,
    captureResponseHeaders: config.captureResponseHeaders,
    captureResponseBody: config.captureResponseBody,
    bodyCaptureLimit: config.bodyCaptureLimit,
    redactionPatterns: [...config.redactionPatterns],
  };
}
