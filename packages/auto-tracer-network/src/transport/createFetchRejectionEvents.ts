import { createFailedCompletionEvent } from "../events/createFailedCompletionEvent.js";
import { createStructuredDetailEvent } from "../events/createStructuredDetailEvent.js";
import { extractFailureDetail } from "../outcomes/extractFailureDetail.js";

/**
 * Creates the lifecycle and optional detail events for a Fetch rejection.
 *
 * @param input - Request identity, timing, and native rejection value.
 * @returns A failed completion and optional native failure detail.
 */
export function createFetchRejectionEvents(
  input: Readonly<{
    requestId: number;
    method: string;
    requestedUrl: string;
    elapsedMilliseconds: number;
    failure: unknown;
  }>,
): Readonly<{
  completion: ReturnType<typeof createFailedCompletionEvent>;
  failureDetail?: ReturnType<typeof createStructuredDetailEvent>;
}> {
  const completion = createFailedCompletionEvent({
    requestId: input.requestId,
    method: input.method,
    url: input.requestedUrl,
    elapsedMilliseconds: input.elapsedMilliseconds,
  });
  const failureDetail = extractFailureDetail(input.failure);

  if (failureDetail === undefined) return { completion };

  return {
    completion,
    failureDetail: createStructuredDetailEvent(
      input.requestId,
      "failure",
      failureDetail,
    ),
  };
}
