import { getNetworkRequestAdmission } from "../automatic-stop/getNetworkRequestAdmission.js";

/**
 * Allocates request identity before resolving filtering and admission.
 *
 * @param getNextRequestId - Consumes the next session request identifier.
 * @param normalizedRequestedUrl - Absolute requested URL to evaluate.
 * @param input - Filtering and automatic-stop admission inputs.
 * @returns The request identifier and immutable admission decision.
 */
export function allocateNetworkRequestAdmission(
  getNextRequestId: () => number,
  normalizedRequestedUrl: string,
  input: Readonly<{
    filters: Readonly<{
      includePatterns: readonly string[];
      excludePatterns: readonly string[];
    }>;
    admittedRequestCount: number;
    autoStopLimit: number | undefined;
  }>,
): Readonly<{
  requestId: number;
  included: boolean;
  admitted: boolean;
  admittedRequestCount: number;
  automaticStopTriggered: boolean;
}> {
  const requestId = getNextRequestId();

  return {
    requestId,
    ...getNetworkRequestAdmission(
      normalizedRequestedUrl,
      input.filters,
      {
        admittedRequestCount: input.admittedRequestCount,
        autoStopLimit: input.autoStopLimit,
      },
    ),
  };
}
