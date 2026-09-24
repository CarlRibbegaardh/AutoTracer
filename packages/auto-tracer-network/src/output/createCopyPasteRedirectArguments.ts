import type { RedirectCompletionEvent } from "../events/RedirectCompletionEvent.js";
import { concatenateEventTokens } from "./concatenateEventTokens.js";

/**
 * Creates one plain multiline console argument for a redirect event.
 *
 * @param event - Renderer-neutral redirect completion event.
 * @returns One complete copy-paste redirect block.
 */
export function createCopyPasteRedirectArguments(
  event: RedirectCompletionEvent,
): readonly [string] {
  const completion = concatenateEventTokens(event.completionTokens);
  const requested = concatenateEventTokens(event.requestedTokens);
  const final = concatenateEventTokens(event.finalTokens);

  return [`${completion}\n${requested}\n${final}`];
}
