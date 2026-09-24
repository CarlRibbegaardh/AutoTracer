import type { NetworkTracerConfigStorage } from "./NetworkTracerConfigStorage.js";
import type { PersistedNetworkTracerConfig } from "./PersistedNetworkTracerConfig.js";
import { validateAutoStopAfterRequests } from "./validateAutoStopAfterRequests.js";
import { validateBodyCaptureLimit } from "./validateBodyCaptureLimit.js";

/**
 * Reads a valid version 1 NetworkTracer configuration document.
 *
 * @param storage - Storage containing the persisted configuration document.
 * @returns The persisted settings, or `undefined` when the document is absent or invalid.
 */
export function readPersistedNetworkTracerConfig(
  storage: NetworkTracerConfigStorage,
): PersistedNetworkTracerConfig | undefined {
  const rawDocument = storage.getItem("__autotracer.network.config.v1");
  if (rawDocument === null) return undefined;

  try {
    const document: unknown = JSON.parse(rawDocument);
    if (
      typeof document !== "object" ||
      document === null ||
      !("version" in document) ||
      document.version !== 1 ||
      !("config" in document) ||
      typeof document.config !== "object" ||
      document.config === null
    ) {
      return undefined;
    }

    const config = document.config;
    const enabledOnLoad =
      "enabledOnLoad" in config ? config.enabledOnLoad : undefined;
    const captureRequestHeaders =
      "captureRequestHeaders" in config
        ? config.captureRequestHeaders
        : undefined;
    const captureRequestBody =
      "captureRequestBody" in config ? config.captureRequestBody : undefined;
    const captureResponseHeaders =
      "captureResponseHeaders" in config
        ? config.captureResponseHeaders
        : undefined;
    const captureResponseBody =
      "captureResponseBody" in config ? config.captureResponseBody : undefined;
    const bodyCaptureLimit =
      "bodyCaptureLimit" in config ? config.bodyCaptureLimit : undefined;
    const redactionPatterns =
      "redactionPatterns" in config ? config.redactionPatterns : undefined;
    const includePatterns =
      "includePatterns" in config ? config.includePatterns : undefined;
    const excludePatterns =
      "excludePatterns" in config ? config.excludePatterns : undefined;
    const waitForPendingRequestsOnStop =
      "waitForPendingRequestsOnStop" in config
        ? config.waitForPendingRequestsOnStop
        : undefined;
    const autoStopAfterRequests =
      "autoStopAfterRequests" in config
        ? config.autoStopAfterRequests
        : undefined;
    const allowedKeys = [
      "enabledOnLoad",
      "captureRequestHeaders",
      "captureRequestBody",
      "captureResponseHeaders",
      "captureResponseBody",
      "bodyCaptureLimit",
      "redactionPatterns",
      "includePatterns",
      "excludePatterns",
      "waitForPendingRequestsOnStop",
      "autoStopAfterRequests",
    ];
    if (
      Object.keys(config).some((key) => {
        return !allowedKeys.includes(key);
      }) ||
      (enabledOnLoad !== undefined && typeof enabledOnLoad !== "boolean") ||
      (captureRequestHeaders !== undefined &&
        typeof captureRequestHeaders !== "boolean") ||
      (captureRequestBody !== undefined &&
        typeof captureRequestBody !== "boolean") ||
      (captureResponseHeaders !== undefined &&
        typeof captureResponseHeaders !== "boolean") ||
      (captureResponseBody !== undefined &&
        typeof captureResponseBody !== "boolean") ||
      (redactionPatterns !== undefined &&
        (!Array.isArray(redactionPatterns) ||
          !redactionPatterns.every((pattern) => {
            return typeof pattern === "string";
          }))) ||
      (includePatterns !== undefined &&
        (!Array.isArray(includePatterns) ||
          !includePatterns.every((pattern) => {
            return typeof pattern === "string";
          }))) ||
      (excludePatterns !== undefined &&
        (!Array.isArray(excludePatterns) ||
          !excludePatterns.every((pattern) => {
            return typeof pattern === "string";
          }))) ||
      (waitForPendingRequestsOnStop !== undefined &&
        typeof waitForPendingRequestsOnStop !== "boolean")
    ) {
      return undefined;
    }

    const validatedBodyCaptureLimit =
      bodyCaptureLimit === undefined
        ? undefined
        : validateBodyCaptureLimit(bodyCaptureLimit);
    const validatedAutoStopAfterRequests = validateAutoStopAfterRequests(
      autoStopAfterRequests,
    );

    return {
      ...(enabledOnLoad === undefined ? {} : { enabledOnLoad }),
      ...(captureRequestHeaders === undefined ? {} : { captureRequestHeaders }),
      ...(captureRequestBody === undefined ? {} : { captureRequestBody }),
      ...(captureResponseHeaders === undefined
        ? {}
        : { captureResponseHeaders }),
      ...(captureResponseBody === undefined ? {} : { captureResponseBody }),
      ...(validatedBodyCaptureLimit === undefined
        ? {}
        : { bodyCaptureLimit: validatedBodyCaptureLimit }),
      ...(redactionPatterns === undefined
        ? {}
        : { redactionPatterns: [...redactionPatterns] }),
      ...(includePatterns === undefined
        ? {}
        : { includePatterns: [...includePatterns] }),
      ...(excludePatterns === undefined
        ? {}
        : { excludePatterns: [...excludePatterns] }),
      ...(waitForPendingRequestsOnStop === undefined
        ? {}
        : { waitForPendingRequestsOnStop }),
      ...(validatedAutoStopAfterRequests === undefined
        ? {}
        : { autoStopAfterRequests: validatedAutoStopAfterRequests }),
    };
  } catch {
    return undefined;
  }
}
