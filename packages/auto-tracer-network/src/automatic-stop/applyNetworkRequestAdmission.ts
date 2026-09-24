import type { IncludedRequestAdmissionTransition } from "./IncludedRequestAdmissionTransition.js";

/**
 * Applies the state writes for one request admission decision.
 *
 * @param admission - Immutable included-request admission transition.
 * @param setAdmittedRequestCount - Persists the admitted-request count.
 * @param enterStopping - Enters automatic-stop draining state for a limit.
 */
export function applyNetworkRequestAdmission(
  admission: IncludedRequestAdmissionTransition,
  setAdmittedRequestCount: (count: number) => void,
  enterStopping: (requestLimit: number) => void,
): void {
  if (!admission.admitted) return;

  setAdmittedRequestCount(admission.admittedRequestCount);

  if (admission.automaticStopTriggered) {
    enterStopping(admission.admittedRequestCount);
  }
}
