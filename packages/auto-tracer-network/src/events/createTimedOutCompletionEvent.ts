import { formatElapsedDuration } from "../timing/formatElapsedDuration.js";
import type { EventToken } from "./EventToken.js";

/**
 * Creates renderer-neutral tokens for a timed-out transport completion.
 *
 * @param input - Request identity and elapsed duration.
 * @returns An immutable timed-out completion event.
 */
export function createTimedOutCompletionEvent(input: Readonly<{
  requestId: number;
  method: string;
  url: string;
  elapsedMilliseconds: number;
}>): {
  readonly kind: "timed-out-completion";
  readonly tokens: readonly EventToken[];
} {
  return {
    kind: "timed-out-completion",
    tokens: [
      { role: "identity", text: `Network #${input.requestId}` },
      { role: "direction", text: " <- " },
      { role: "outcome", text: "TIMED OUT" },
      { role: "plain", text: " " },
      { role: "method", text: input.method },
      { role: "plain", text: " " },
      { role: "url", text: input.url },
      { role: "plain", text: " (" },
      {
        role: "duration",
        text: formatElapsedDuration(input.elapsedMilliseconds),
      },
      { role: "plain", text: ")" },
    ],
  };
}
