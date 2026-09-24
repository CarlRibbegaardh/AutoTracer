import type { NetworkTracerConfigOverrides } from "../configuration/NetworkTracerConfigOverrides.js";
import { resolveNetworkTracerConfig } from "../configuration/resolveNetworkTracerConfig.js";

/**
 * Returns initializer setting names whose resolved values differ.
 *
 * @param firstDefaults - Defaults owned by the first initializer.
 * @param laterDefaults - Defaults supplied by a later initializer.
 * @returns Setting names with semantically different resolved values.
 */
export function getConflictingNetworkTracerDefaultKeys(
  firstDefaults: NetworkTracerConfigOverrides,
  laterDefaults: NetworkTracerConfigOverrides,
): readonly string[] {
  const first = resolveNetworkTracerConfig(firstDefaults, {});
  const later = resolveNetworkTracerConfig(laterDefaults, {});
  const comparisons = [
    ["enabledOnLoad", first.enabledOnLoad === later.enabledOnLoad],
    [
      "captureRequestHeaders",
      first.captureRequestHeaders === later.captureRequestHeaders,
    ],
    ["captureRequestBody", first.captureRequestBody === later.captureRequestBody],
    [
      "captureResponseHeaders",
      first.captureResponseHeaders === later.captureResponseHeaders,
    ],
    [
      "captureResponseBody",
      first.captureResponseBody === later.captureResponseBody,
    ],
    ["bodyCaptureLimit", first.bodyCaptureLimit === later.bodyCaptureLimit],
    [
      "redactionPatterns",
      JSON.stringify(first.redactionPatterns) ===
        JSON.stringify(later.redactionPatterns),
    ],
    [
      "includePatterns",
      JSON.stringify(first.includePatterns) === JSON.stringify(later.includePatterns),
    ],
    [
      "excludePatterns",
      JSON.stringify(first.excludePatterns) === JSON.stringify(later.excludePatterns),
    ],
    [
      "waitForPendingRequestsOnStop",
      first.waitForPendingRequestsOnStop === later.waitForPendingRequestsOnStop,
    ],
    [
      "autoStopAfterRequests",
      first.autoStopAfterRequests === later.autoStopAfterRequests,
    ],
  ] as const;

  return comparisons.filter((comparison) => {return !comparison[1]}).map((comparison) => {return comparison[0]});
}
