import type { EventToken } from "./EventToken.js";

/**
 * Renderer-neutral multiline redirect completion event.
 */
export type RedirectCompletionEvent = Readonly<{
  kind: "redirect-completion";
  completionTokens: readonly EventToken[];
  requestedTokens: readonly EventToken[];
  finalTokens: readonly EventToken[];
}>;
