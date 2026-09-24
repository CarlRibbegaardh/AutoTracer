import { createAbortedCompletionEvent } from "../events/createAbortedCompletionEvent.js";
import { createFailedCompletionEvent } from "../events/createFailedCompletionEvent.js";
import { createHttpCompletionEvent } from "../events/createHttpCompletionEvent.js";
import { createRedirectCompletionEvent } from "../events/createRedirectCompletionEvent.js";
import { createTimedOutCompletionEvent } from "../events/createTimedOutCompletionEvent.js";
import { getXhrRedirectUrl } from "../redirects/getXhrRedirectUrl.js";

/**
 * Creates the terminal event for one native XHR terminal event.
 *
 * @param input - Request identity and browser-exposed terminal metadata.
 * @returns An HTTP, redirect, failure, abort, or timeout completion event.
 */
export function createXhrTerminalEvent(input: Readonly<{
  eventType: "load" | "error" | "abort" | "timeout";
  requestId: number;
  status: number;
  method: string;
  requestedUrl: string;
  normalizedRequestedUrl: string;
  responseUrl: string;
  elapsedMilliseconds: number;
}>):
  | ReturnType<typeof createHttpCompletionEvent>
  | ReturnType<typeof createRedirectCompletionEvent>
  | ReturnType<typeof createFailedCompletionEvent>
  | ReturnType<typeof createAbortedCompletionEvent>
  | ReturnType<typeof createTimedOutCompletionEvent> {
  const terminalInput = {
    requestId: input.requestId,
    method: input.method,
    url: input.requestedUrl,
    elapsedMilliseconds: input.elapsedMilliseconds,
  };

  if (input.eventType !== "load") {
    const createOutcomeEvent = {
      error: createFailedCompletionEvent,
      abort: createAbortedCompletionEvent,
      timeout: createTimedOutCompletionEvent,
    }[input.eventType];

    return createOutcomeEvent(terminalInput);
  }

  const finalUrl = getXhrRedirectUrl(
    input.normalizedRequestedUrl,
    input.responseUrl,
  );
  if (finalUrl === undefined) {
    return createHttpCompletionEvent({
      ...terminalInput,
      status: input.status,
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
