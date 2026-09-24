import { normalizeRequestedUrl } from "../filtering/normalizeRequestedUrl.js";
import { allocateNetworkRequestAdmission } from "../identity/allocateNetworkRequestAdmission.js";
import { formatDisplayUrl } from "../presentation/formatDisplayUrl.js";
import type { XhrOpenMetadata } from "./XhrOpenMetadata.js";

/**
 * Allocates identity and resolves admission for one XHR send invocation.
 *
 * @param getNextRequestId - Consumes the next session request identifier.
 * @param openMetadata - Metadata from the latest XHR open invocation.
 * @param input - URL normalization, filtering, and admission inputs.
 * @returns XHR URL identity and immutable admission decision.
 */
export function allocateXhrSendAdmission(
  getNextRequestId: () => number,
  openMetadata: XhrOpenMetadata,
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
  const normalizedRequestedUrl = normalizeRequestedUrl(
    openMetadata.requestedUrl,
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
