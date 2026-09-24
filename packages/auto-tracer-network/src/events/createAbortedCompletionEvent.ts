import { formatElapsedDuration } from "../timing/formatElapsedDuration.js";
import type { EventToken } from "./EventToken.js";

/**
 * Creates renderer-neutral tokens for an aborted transport completion.
 *
 * @param input - Request identity and elapsed duration.
 * @returns An immutable aborted completion event.
 */
export function createAbortedCompletionEvent(input: Readonly<{
  requestId: number;
  method: string;
  url: string;
  elapsedMilliseconds: number;
}>): {
  readonly kind: "aborted-completion";
  readonly tokens: readonly EventToken[];
} {
  return {
    kind: "aborted-completion",
    tokens: [
      { role: "identity", text: `Network #${input.requestId}` },
      { role: "direction", text: " <- " },
      { role: "outcome", text: "ABORTED" },
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
