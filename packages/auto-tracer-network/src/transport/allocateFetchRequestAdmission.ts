import { normalizeRequestedUrl } from "../filtering/normalizeRequestedUrl.js";
import { allocateNetworkRequestAdmission } from "../identity/allocateNetworkRequestAdmission.js";
import { formatDisplayUrl } from "../presentation/formatDisplayUrl.js";
import { getFetchRequestedUrl } from "./getFetchRequestedUrl.js";

/**
 * Allocates identity and resolves admission for one Fetch input.
 *
 * @param getNextRequestId - Consumes the next session request identifier.
 * @param fetchInput - Original Fetch request input.
 * @param input - URL normalization, filtering, and admission inputs.
 * @returns Fetch URL identity and immutable admission decision.
 */
export function allocateFetchRequestAdmission(
  getNextRequestId: () => number,
  fetchInput: RequestInfo | URL,
  input: Readonly<{
    baseUrl: string;
    redactionPatterns: readonly string[];
    includePatterns: readonly string[];
    excludePatterns: readonly string[];
    admittedRequestCount: number;
    autoStopLimit: number | undefined;
  }>,
): Readonly<{
  requestId: number;
  requestedUrl: string;
  normalizedRequestedUrl: string;
  included: boolean;
  admitted: boolean;
  admittedRequestCount: number;
  automaticStopTriggered: boolean;
}> {
  const requestedUrl = getFetchRequestedUrl(fetchInput);
  const normalizedRequestedUrl = normalizeRequestedUrl(
    requestedUrl,
    input.baseUrl,
  );

  return {
    requestedUrl: formatDisplayUrl(
      normalizedRequestedUrl,
      input.baseUrl,
      input.redactionPatterns,
    ),
    normalizedRequestedUrl,
    ...allocateNetworkRequestAdmission(
      getNextRequestId,
      normalizedRequestedUrl,
      {
        filters: {
          includePatterns: input.includePatterns,
          excludePatterns: input.excludePatterns,
        },
        admittedRequestCount: input.admittedRequestCount,
        autoStopLimit: input.autoStopLimit,
      },
    ),
  };
}
