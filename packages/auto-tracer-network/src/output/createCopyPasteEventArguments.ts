import type { TokenizedEvent } from "../events/TokenizedEvent.js";
import { concatenateEventTokens } from "./concatenateEventTokens.js";

/**
 * Creates one plain console argument for a token-only event.
 *
 * @param event - Renderer-neutral token event.
 * @returns One complete copy-paste event line.
 */
export function createCopyPasteEventArguments(
  event: TokenizedEvent,
): readonly [string] {
  return [concatenateEventTokens(event.tokens)];
}
