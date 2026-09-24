import { isNetworkRequestIncluded } from "../filtering/isNetworkRequestIncluded.js";
import { getIncludedRequestAdmissionTransition } from "./getIncludedRequestAdmissionTransition.js";

/**
 * Resolves filtering and automatic-stop admission for one network request.
 *
 * @param normalizedRequestedUrl - Absolute requested URL to evaluate.
 * @param filters - Include and exclude URL patterns.
 * @param admission - Current included count and optional automatic-stop limit.
 * @returns The immutable request admission decision.
 */
export function getNetworkRequestAdmission(
  normalizedRequestedUrl: string,
  filters: Readonly<{
    includePatterns: readonly string[];
    excludePatterns: readonly string[];
  }>,
  admission: Readonly<{
    admittedRequestCount: number;
    autoStopLimit: number | undefined;
  }>,
): Readonly<{
  included: boolean;
  admitted: boolean;
  admittedRequestCount: number;
  automaticStopTriggered: boolean;
}> {
  const included = isNetworkRequestIncluded(
    normalizedRequestedUrl,
    filters.includePatterns,
    filters.excludePatterns,
  );

  if (!included) {
    return {
      included: false,
      admitted: false,
      admittedRequestCount: admission.admittedRequestCount,
      automaticStopTriggered: false,
    };
  }

  return {
    included: true,
    ...getIncludedRequestAdmissionTransition(
      admission.admittedRequestCount,
      admission.autoStopLimit,
    ),
  };
}
