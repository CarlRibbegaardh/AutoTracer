import { createHttpCompletionEvent } from "../events/createHttpCompletionEvent.js";
import { createRedirectCompletionEvent } from "../events/createRedirectCompletionEvent.js";
import { getFetchRedirectUrl } from "../redirects/getFetchRedirectUrl.js";

/**
 * Creates the appropriate completion event from Fetch response metadata.
 *
 * @param input - Request identity and browser-exposed response metadata.
 * @returns An ordinary or redirected HTTP completion event.
 */
export function createFetchCompletionEvent(
  input: Readonly<{
    requestId: number;
    status: number;
    method: string;
    requestedUrl: string;
    responseUrl: string;
    redirected: boolean;
    elapsedMilliseconds: number;
  }>,
):
  | ReturnType<typeof createHttpCompletionEvent>
  | ReturnType<typeof createRedirectCompletionEvent> {
  const finalUrl = getFetchRedirectUrl(input.redirected, input.responseUrl);

  if (finalUrl === undefined) {
    return createHttpCompletionEvent({
      requestId: input.requestId,
      status: input.status,
      method: input.method,
      url: input.requestedUrl,
      elapsedMilliseconds: input.elapsedMilliseconds,
    });
  }

  return createRedirectCompletionEvent({
    requestId: input.requestId,
    status: input.status,
    method: input.method,
    requestedUrl: input.requestedUrl,
    finalUrl,
    elapsedMilliseconds: input.elapsedMilliseconds,
  });
}
