import { updateIncludedAdmissionCount } from "../identity/updateIncludedAdmissionCount.js";
import { hasReachedAutomaticStopLimit } from "./hasReachedAutomaticStopLimit.js";
import type { IncludedRequestAdmissionTransition } from "./IncludedRequestAdmissionTransition.js";
import { shouldAdmitIncludedRequest } from "./shouldAdmitIncludedRequest.js";

/**
 * Resolves the admission transition for one already-included request.
 *
 * @param admittedRequestCount - Included requests admitted before this request.
 * @param autoStopLimit - Included-request limit, or undefined when disabled.
 * @returns The immutable admission transition.
 */
export function getIncludedRequestAdmissionTransition(
  admittedRequestCount: number,
  autoStopLimit: number | undefined,
): IncludedRequestAdmissionTransition {
  const admitted = shouldAdmitIncludedRequest(
    admittedRequestCount,
    autoStopLimit,
  );

  if (!admitted) {
    return {
      admitted: false,
      admittedRequestCount,
      automaticStopTriggered: false,
    };
  }

  const nextAdmissionCount = updateIncludedAdmissionCount(
    admittedRequestCount,
    true,
  );

  return {
    admitted: true,
    admittedRequestCount: nextAdmissionCount,
    automaticStopTriggered: hasReachedAutomaticStopLimit(
      nextAdmissionCount,
      autoStopLimit,
    ),
  };
}
