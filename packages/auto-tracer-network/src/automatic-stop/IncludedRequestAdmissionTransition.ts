/**
 * Immutable automatic-stop transition for one included request.
 */
export interface IncludedRequestAdmissionTransition {
  /** Whether the request is admitted to the active trace. */
  readonly admitted: boolean;

  /** Included-request count after the admission decision. */
  readonly admittedRequestCount: number;

  /** Whether this admission reaches the automatic-stop limit. */
  readonly automaticStopTriggered: boolean;
}
